import {createServer} from 'http'
import {readFile} from 'fs/promises'
import { writeFile } from 'fs/promises';
import path from 'path'
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();


import { error } from 'console';
const serveFile=async(res,filepath,content)=>{
    try{
        const data=await readFile(filepath);
        res.writeHead(200,{"Content-Type":content})
        res.end(data);
    }
    catch(error){
        res.writeHead(404,{"Content-Type":content})
        res.end("404 error hai")
    }

}
const loadlink=async()=>{
    try{
        const data=await readFile(path.join("data","links.json"));
        return JSON.parse(data)//returning the data to links,so link variable now has the data in parsed form of links.json
    }
    catch(e){
        if(e.code=="ENOENT"){ //EROOR NO ENTRY, THE FILE NOT BE MADE, SO WE GONNA MAKE IT.
            await writeFile(path.join("data","links.json"),JSON.stringify({}))//made a file, at the spot and added a empty json using json.stringifiy({})
       return{}}
       throw e;
    }
}
const save=async(links)=>{
    try{
    await writeFile(path.join("data","links.json"),JSON.stringify(links))//we didn't used only links only, bcz links is a object but we need to add a json in that file, links is a object bcz whnever it gets a values, it is getting after Json.parse()
    }
    catch(e){
console.log(e);
    }

}
const server=createServer(async(req,res)=>{
    if(req.method=="GET"){
        if(req.url=='/'){
           serveFile(res,path.join("public","index.html"),"text/html")
        }
       else if(req.url=='/style.css'){
            serveFile(res,path.join("public","style.css"),"text/css")
        }
        else if(req.url=='/link'){
            const link=await loadlink();
            res.writeHead(200,{"Content-Type":"text/plain"})
           return res.end(JSON.stringify(link))
        }
        else {
            const link=await loadlink();
            const ak=req.url.slice(1);//                                
            console.log(ak)
            if(link[ak]){
                res.writeHead(302,{location:link[ak]})
                return res.end();
            }
            res.writeHead(404,{"Content-Type":"text/plain"})
            return res.end()
            
        }
    }
    if(req.method=="POST" && req.url=='/shorten'){
       
            const links=await loadlink();
            let dat="";
            req.on("data",(hunk)=>{
                dat=dat+hunk;
            })
            req.on("end",async()=>{
                
                const{url,shortenCode}=JSON.parse(dat);
                console.log(url);
                if(!url){
                    res.writeHead(404,{"Content-Type":"text/plain"})
                    return res.end("url is rquired")
                }
                const finalCode=shortenCode||crypto.randomBytes(4).toString("hex")//A hex string (short for hexadecimal string) is a sequence of characters that represents binary data using base-16 notation. It uses 16 symbols: 0 1 2 3 4 5 6 7 8 9 A B C D E F Each hex digit represents 4 bits, so two hex digits represent 1 byte
                 if(links[finalCode]){
                     res.writeHead(404,{"Content-Type":"text/plain"})
                    return res.end("url is used previously")

                 }
                 links[finalCode]=url;
                 await save(links);
                 res.writeHead(200,{"Content-Type":"application/json"})
                 res.end();
            })
        }
    
})
const PORT=process.env.PORT||3000;

server.listen(PORT,()=>{
    console.log("server is running");
})