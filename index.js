/**
 * 
 * @param {string} classString 
 */
function class2Function(classString){
  const className=classString.split(" ")[1].split("{")[0]
  const funcs=getFunctions(classString.substring(classString.indexOf("{")+1,classString.lastIndexOf("}")))
  const constructorFunction=funcs.find(v=>v.name==="constructor")
  const constructorFunctionString=`function ${className}${constructorFunction.arguments}${constructorFunction.body}`

  const instanceFuncs=funcs.filter(v=>v.name!=="constructor"&&!v.isStatic&&!v.isSetter&&!v.isGetter)
    .map(func=>`${className}.prototype.${func.name}=function${func.arguments}${func.body}`)
  console.log(instanceFuncs)
  const staticFuncs=funcs.filter(v=>v.isStatic)
}

function getEndOfFunction(funString){
  let depth=0
  let start=0
  for(let i=0;i<funString.length;i++){
    if(funString[i]==="{"){
      depth++
      if(start===0)start=i
    }
    if(funString[i]==="}")depth--
    if(start!==0&&depth===0)return i+1
  }
  return funString.length
}

function getFunctions(classBody){
  let result=[]
  while(classBody){
    let end=getEndOfFunction(classBody)
    result.push(classBody.substring(0,end))
    classBody=classBody.substring(end)
  }
  return result.map(str=>{
    if(!str)return false
    if(!str.match(/\w/))return false
    str=str.substring(str.match(/\w/).index)
    const result={}
    result.isStatic=str.startsWith("static")
    if(result.isStatic){
      str=str.substring(7)
    }
    result.isGetter=str.startsWith("get")
    result.isSetter=str.startsWith("set")
    if(result.isGetter||result.isSetter){
      str=str.substring(3)
    }
    result.name=str.match(/\w+/)[0]
    result.arguments=str.match(/\([\w,]*\)/)[0]
    result.body=str.substring(str.search("{"),getEndOfFunction(str))
    return result
  }).filter(v=>v)
}


console.log(class2Function(`
class Hoge{
  constructor(hoge){
    this.hoge=hoge
    this.fn=function(){
      let a={hello:{"world"}}
    }
    this.obj={foo:"bar"}
  }

  log(){
    console.log(this.hoge)
  }

  change(str){
    this.hoge=str
  }

  static sayHoge(){
    console.log("Hoge!!")
  }

}
`))