环境依赖
=======
+ [node](http://nodejs.org)
+ [npm](https://www.npmjs.com)
+ [ruby](https://www.ruby-lang.org)
+ [gem](https://rubygems.org)
+ [libjpeg-turbo](http://libjpeg-turbo.virtualgl.org)
+ [optipng](http://optipng.sourceforge.net)

安装构建依赖
==========
[grunt](http://www.gruntjs.com)
[bower](http://bower.io)
使用root/管理员 身份安装
```shell
npm install -g grunt-cli
npm install -g bower
```
[compass](http://compass-style.org)
```shell
gem install compass
```
 
安装依赖
==========
*nix 使用命令
```shell
npm install && bower install
```

Windows cmd/PowerShell 使用命令
```shell
npm install
bower install
```

代码结构
==========
+ app 软件源代码
+ test 存放测试用例
+ express 存放mock数据，目前测试用例和软件模拟数据均放在一起，以后可能分开

过程文件/临时文件
- mocks 存放mock数据调用的记录
- .tmp .sass-cache 过程文件
- bower_components bower 依赖
- node_modules node 依赖

添加依赖
==========

前端依赖使用bower命令添加，例如：
```shell
bower install jquery -S
```
构建环境依赖使用npm命令添加，例如：
前端依赖使用bower命令添加，例如：
```shell
npm install grunt-contrib-handlebars -D
```

