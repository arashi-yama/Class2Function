/**
 * 
 * @param {string} classString 
 */
function class2Function(classString){
  const className=classString.split(" ")[1].split("{")[0]
  const funcs=getFunctions(classString.substring(classString.indexOf("{")+1,classString.lastIndexOf("}")))
  const constructorFunction=funcs.find(v=>v.name==="constructor")
  const constructorFunctionString=`function ${className}${constructorFunction.arguments}${constructorFunction.body}`
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
      return `Object.defineProperty(${className+(isStatic?"":".prototype")},${name},${property})`
    })
  return [constructorFunctionString,...methods].join("\n\n")
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
    result.arguments=str.match(/\([\w,]*\)/)[0]
    result.body=str.substring(str.search("{"),getEndOfFunction(str))
    return result
  }).filter(v=>v)
}


exports.class2Function=class2Function