###

## 安装
```
npm i 

pwd // 当前目录 A
```



## 调试
在B项目 

```
npm link [A]
mpaas -V // 显示版本

mpaas zip // 打包
```



## 使用
B项目 package.json

```
script: {
  "ziptest": "mpaas -V"
},
devDependencies: {
  "@ether/mpaas-plugin-cli": "0.0.4"
}

```


