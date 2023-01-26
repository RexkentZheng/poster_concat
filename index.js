const request = require('request')
const download = require('download')
const im = require("imagemagick")
const ImgConcat = require('@jyeontu/img-concat');
const data = require('./data.js')
const idList = require('./ids.js')
const imageBaseUrl = 'https://image.tmdb.org/t/p/original'

const arguments = process.argv;
const ImgConcatClass = new ImgConcat();
const getContent = RegExp(/(?<=《).*?(?=》)/g)
const isChinese = new RegExp("[\u4E00-\u9FA5]+");

const names = [...data.allStr.matchAll(getContent)].filter(item => isChinese.test(item[0])).map(item => item[0])


const ids = idList.ids.split('\n').filter(id => !!id)

const fillPosters = (names) => {
	const errNames = []
	return Promise.all(names.map((name) => {
		return new Promise((reslove, reject) => {
			return request.get({
				url: encodeURI(`https://api.themoviedb.org/3/search/movie?api_key=1b311eadd5f9863714486717ba314840&language=zh-CHS&query=${name}&page=1&include_adult=false`)
			}, (err, res, body) => {
				const results = JSON.parse(body).results
				if (!results.length) {
					errNames.push(name)
					reslove()
				} else {
					return download(
						`${imageBaseUrl}${results[0].poster_path}`,
						'./posters',
						{
							filename: `${name}.jpg`
						}
					).then(() => {
						console.log(`${name}.jpg下载成功`);
						reslove()
					})
				}
			})
		})
	})).then(() => {
		if (!errNames.length) {
			console.log(`无法找到的影片为：${errNames}`);
		}
		console.log('海报下载完成')
	});
}

const fillPostersByID = (ids) => {
	console.log('开始拉取海报！')
	return Promise.all(ids.map((id) =>
		new Promise((reslove) => {
			request.get({
				url: encodeURI(`https://api.themoviedb.org/3/movie/${id}?api_key=1b311eadd5f9863714486717ba314840&language=en-US`)
			}, (err, res, body) => {
				const results = JSON.parse(body)
				const { poster_path, title } = results
				return download(
					`${imageBaseUrl}${poster_path}`,
					'./posters',
					{
						filename: `${id}.jpg`
					}
				).then(() => {
					console.log(`${id}.jpg下载成功 ${title}`);
					reslove()
				})
			})
		})
	)).then(() => {
		console.log('海报下载完成')
	})
}

const joinImgs = (names) => {
	console.log('开始拼接海报', names)
	const finalArr = []
	let helper = [];
	names.forEach((name, index) => {
		helper.push(`./posters/${name}.jpg`);
		if (helper.length === 5) {
			finalArr.push(JSON.parse(JSON.stringify(helper)));
			helper = []
		} else if (index === names.length - 1) {
			finalArr.push(JSON.parse(JSON.stringify(helper)));
		}
	})

	ImgConcatClass.conCatByMaxit({
		shape: finalArr,
		target: './output/'
	}).then(res => {
		console.log(`拼接完成,图片路径为${res}，开始压缩`);
		console.log('压缩过程较久，请耐心等待');
		im.resize({
			srcPath: res,
			dstPath: './output/tada.jpg',
			width:3000,
		}, (err, stdout, stderr) => {
			if (err) {
				console.log(`压缩失败：${err}`)
			} else {
				console.log(`压缩完成！！！`);
			}
		})
	});
}

const main = ([_node_path, _file_path, type]) => {
	if (!type) {
		return console.log('请传入必传参数，1为通过ID下载海报，2为通过名称下载海报，3为通过ID拼接海报，4为通过名称拼接海报')
	}
	if (+type === 1) {
		fillPostersByID(ids)
	} else if (+type === 2) {
		fillPosters(names)
	} else if (+type === 3) {
		joinImgs(ids)
	} else if (+type === 4) {
		joinImgs(names)
	} else {
		// 防止图片过大做的冗余处理
		ImgConcatClass.collapseVertical({
			left: './output/tada1.jpg',
			right: './output/tada.jpg',
			target:'./output/'
		}).then(res=>{
			console.log(`拼接完成,图片路径为${res}`);
		});
	}
}

main(arguments);









