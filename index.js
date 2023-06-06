import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import _ from 'lodash';


    //create instant of express
const app=express();
    // Set EJS as the view engine
app.set('view engine', 'ejs');
    //use middleware
app.use(bodyParser.urlencoded({extended:true}));
    //tell express to serve public folder as a static folder,inside our public folder i'll create images,js folder etc.
app.use(express.static('public'));


//database work
    const password = 'MAOsoldier#1'; 
    const encodedPassword = encodeURIComponent(password);
    //connection create
    mongoose.connect(`mongodb+srv://sabaazeem_07:${encodedPassword}@cluster0.7im1khm.mongodb.net/todolistDB?retryWrites=true&w=majority`,{useNewUrlParser:true,useUnifiedTopology: true});
    //define Schema
    const itemsSchema={
        name:String,
    };
    //define model
    const Item=mongoose.model("Item",itemsSchema);
    //define documents,write data in our db
    const item1=new Item({
        name:"Cooking",
    });
    const item2=new Item({
        name:"Writing",
    });
    const item3=new Item({
        name:"Exercise",
    });
    const defaultItems=[item1,item2,item3];

    //List Schema(Another Schema)
    const ListSchema={
        name:String,
        items:[itemsSchema]
    };
    //List Model
    const List=mongoose.model("List",ListSchema);
   //route get option
app.get('/',(req,res)=>{
        //read data from db
    Item.find().then((data)=>{
        if(data.length==0){
            
            //insert all documents to db using many function 
                Item.insertMany(defaultItems);
                res.redirect('/');
        }else{
            res.render("list",{pageHeading :"ToDay",newListItems:data}); 
        }
    });
});

    //Express route parameters
app.get("/:customListName",(req,res)=>{
    const listName=_.capitalize(req.params.customListName);
            //first check if exist or not
        List.findOne({name:listName})
        .then((data)=>{
            if(data){
                res.render("list",{pageHeading:listName,newListItems:data.items});
            }else{
                const list=new List({
                    name:listName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+listName);
            }
        });
        
    });

    //route for post option
app.post('/',(req,res)=>{
    let itemName=req.body.newItem;
    let headingName=req.body.button;
    console.log(itemName);
    console.log(headingName);
    let item=new Item({
        name : itemName,
    });
    if(headingName==="ToDay"){
        item.save();
        res.redirect('/');
    }else{
        List.findOne({name:headingName})
        .then((data)=>{
            if(data){
                data.items.push(item);
                data.save();
                res.redirect('/'+headingName);
            }
        })
    }
    
});

app.post("/delete",async(req,res)=>{
    const delItem=req.body.checkbox;
    const modelName=req.body.check;
    if(modelName==="ToDay ToDoList"){
        const deleted = await Item.deleteOne({ _id: delItem });
        if (deleted) {
            res.redirect("/");
        } else {
            console.log("Error in deleting document");
        }
    }else{
        List.updateOne({name:modelName},{$pull:{items:{_id:delItem}}})
        .then(()=>{
            res.redirect('/'+modelName);
        });
    }
});

    //start the server
app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server is started on PORT: 3000");
});
