const request = require('request')
const download = require('download')
const im = require("imagemagick")
const ImgConcat = require('@jyeontu/img-concat');
const data = require('./data.js')
const imageBaseUrl = 'https://image.tmdb.org/t/p/original/'

// curl https://api.themoviedb.org/3/movie/tt1016150?api_key=1b311eadd5f9863714486717ba314840&language=zh-CN

// https://api.themoviedb.org/3/movie/76341?api_key=1b311eadd5f9863714486717ba314840&language=de

const arguments = process.argv;
const ImgConcatClass = new ImgConcat();
const getContent = RegExp(/(?<=《).*?(?=》)/g)
const isChinese = new RegExp("[\u4E00-\u9FA5]+");

const names = [...data.allStr.matchAll(getContent)].filter(item => isChinese.test(item[0])).map(item => item[0])
const errNames = []


const fillPosters = () => {
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
						`https://image.tmdb.org/t/p/original${results[0].poster_path}`,
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
});
}

const joinImgs = () => {
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
	}).then(res=>{
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
		return console.log('请传入必传参数，1为下载海报，2为拼接海报')
	}
	if (+type === 1) {
		console.log('开始下载海报')
		fillPosters()
	} else {
		console.log('开始拼接海报')
		joinImgs()
	}
}

main(arguments);















