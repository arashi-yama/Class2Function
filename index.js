/**
 * 
 * @param {string} classString 
 */
function class2Function(classString){
  const className=classString.split(" ")[1].split("{")[0]
  let parent
  if(classString.split(" ")[2]==="extends"){
    parent=classString.split(" ")[3].split("{")[0]
  }

  const classBody=classString.substring(...getSameDepthRange(classString,"{","}").map((v,i)=>v+i*-2+1))
  const funcs=getFunctions(classBody)
  const constructorFunc=funcs.find(v=>v.name==="constructor")
  let constructorFuncString=""
  if(parent){
    if(constructorFunc){
      const s=constructorFunc.body.substring(constructorFunc.body.indexOf("super"))
    const superArgs=s.substring(...getSameDepthRange(s,"(",")")).replace(/[()]/g,"")
    constructorFunc.body=constructorFunc.body.replace(/super(.*)/,`${parent}.call(this,${superArgs})`)
      constructorFuncString=`function ${className}${constructorFunc.arguments}${constructorFunc.body}`
    }else{
      constructorFuncString=`function ${className}(...args){
        ${parent}.call(this,...args)
      }`
    }
    
  }
  const methods=funcs.filter(v=>v.name!=="constructor")
    .map(({name,arguments,body,isGetter,isSetter,isStatic})=>{
      let property=""
      if(isGetter){
        property=`{
          get:function()${body}
        }`
      }else if(isSetter){
        property=`{
          set:function${arguments}${body}
        }`
      }else{
        property=`function${arguments}${body}`
      }
      return `Object.defineProperty("${className+(isStatic?'':'.prototype')}",${name},${property})`
    })
  return [constructorFuncString,...methods].join("\n\n")
}

function getEndOfFunction(funString){
  const argslen=getSameDepthRange(funString,"(",")")[1]
  let bodylen=getSameDepthRange(funString.substring(argslen),"{","}")[1]
  if(!argslen||!bodylen)return 0
  return bodylen+argslen
}

function getSameDepthRange(str,open,close){
  const start=str.indexOf(open)
  let depth=0
  for(let i=start;Boolean(str[i]);i++){
    if(str[i]===open)depth++
    if(str[i]===close){
      depth--
      if(depth===0)return [start,i+1]
    }
  }
  return false
}

function getFunctions(classBody){
  let result=[]
  while(true){
    let end=getEndOfFunction(classBody)
    if(end===0)break
    result.push(classBody.substring(0,end))
    classBody=classBody.substring(end)
  }
  return result.map(str=>{
    if(!str)return false
    if(!str.match(/\w/))return false
    str=str.substring(str.match(/\w/).index)
    const result={}
    result.isStatic=str.startsWith("static ")
    if(result.isStatic){
      str=str.substring(7)
    }
    result.isGetter=str.startsWith("get ")
    result.isSetter=str.startsWith("set ")
    if(result.isGetter||result.isSetter){
      str=str.substring(3)
    }
    result.name=str.match(/\w+/)[0]
    result.arguments=str.substring(...getSameDepthRange(str,"(",")"))
    result.body=str.substring(getSameDepthRange(str,"(",")")[1],getEndOfFunction(str))
    return result
  }).filter(v=>v)
}

let str=`
class Hoge extends Array{
  constructor({}={}){
    super(arr,bar)
  }
  sayHoge(){
    console.log("hoge")
  }
}
`
let s=`
("aa")
super(hoge)
`
const boundary="\n---------\n"
exports.class2Function=class2Function