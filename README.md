# 一个用来整合电影海报的小工具

## 使用方法

### 环境准备

对Node版本没啥要求，随意，装下依赖即可

### 数据准备

将数据以字符串的形式放到`data.js`文件中即可，使用书名号包裹电影名称，其他没有任何要求，使用正则匹配拿到电影名称。  
注意，做了中文名称的校验，只识别中文名称。

### 拿到海报

命令行执行：

```
node index.js 1
```

命令行有下载明细的打印，下载文件的名称就是电影名，出现在`/posters`目录下

如果有下载失败的也会打印失败影片名称，请根据名称补齐图片，或者删除数据

建议海报下载完成后检查下图片，有下载出错的概率


### 拼接海报

命令行执行：

```
node index.js 2
```

随即开始拼接，拼接完成后会进行压缩，否则图片太大根本打不开。

拼接结果和压缩结果会出现在`/output`文件夹下，`tada.jpg`就是压缩后的结果，大概长这样。

![img](https://pic1.imgdb.cn/item/6371b5a516f2c2beb115db1e.jpg)



