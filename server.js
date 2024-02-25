const express=require('express')
const mongoose=require('mongoose')
const app=express()
const port=3033
app.use(express.json())
mongoose.connect('mongodb://127.0.0.1:27017/taskmanagement') 
    .then(()=>{
        console.log('succesfully connected to db')
    })
    .catch((err)=>{
        console.log(err)
    })
//Schema
const {Schema,model}=mongoose
const taskSchema=new Schema({
    title:String,
    description:String,
    status:String
},{timestamps:true})
//Model
const Task=model("Task",taskSchema)
//Validations for post
const {checkSchema,validationResult}=require('express-validator')
const taskValidationSchema={
    title:{
        in:['body'],
        exists:{
            errorMessage:'Title is required'
        },
        notEmpty:{
            errorMessage:'title should not be empty'
        },
        isLength:{
            options:{min:4}
        },
        trim:true,
        custom:{
            options:function(value){
                return Task.findOne({title:value})
                    .then((task)=>{
                        if(task){
                            throw new Error('title already exists')
                        }
                        return true
                    })
            }
        }
    },
    description:{
        in:['body'],
        exists:{
            errorMessage:'Description is required'
        },
        notEmpty:{
            errorMessage:'Description should not be empty'
        },
        trim:true
            
    },
    status:{
        in:['body'],
        exists:{
            errorMessage:'Title is required'
        },
        notEmpty:{
            errorMessage:'title should not be empty'
        },
        isIn:{
            options:[['pending','inprogress','completed']],
            errorMessage:('Should be one of (pending,inprogress,completed)')
        }

    }
}
//validation for getbyid and delete
const idValidationSchema={
    id:{
        in:['params'], 
        isMongoId:{
        errorMessage:'Invalid Id'
        }

    }   
    
}
//validation for update
const updateValidationSchema={
    title:{
        in:['body'],
        exists:{
            errorMessage:'title is required'
        },
        notEmpty:{
            errorMessage:'title should not be empty'
        },
        isLength:{
            options:{min:4}
        },
        trim:true,
    },
    description:{
        in:['body'],
        exists:{
            errorMessage:'Description is required'
        },
        notEmpty:{
            errorMessage:'Description should not be empty'
        },
        trim:true
            
    },
    status:{
        in:['body'],
        exists:{
            errorMessage:'Title is required'
        },
        notEmpty:{
            errorMessage:'title should not be empty'
        },
        isIn:{
            options:[['pending','inprogress','completed']],
            errorMessage:('Should be one of (pending,inprogress,completed)')
        }

    },
    id:{
        in:['params'],
        isMongoId:{
            errorMessage:'Invalid Id'
        }
    }
}

app.post('/tasks',checkSchema(taskValidationSchema),(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const body=req.body
    Task.create(body)
        .then((task)=>{
            res.status(201).json(task)
        })
        .catch((err)=>{
            res.status(500).json('Internal server error')
        })    
})
app.get('/tasks',(req,res)=>{
    Task.find()
        .then((task)=>{
            res.status(200).json(task)
        })
        .catch((err)=>{
            res.json({})
        })
})
app.get('/tasks/:id',checkSchema(idValidationSchema),(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const id=req.params.id
    console.log(id)
    Task.findById(id)
        .then((task)=>{
            res.json(task)
        })
        .catch((err)=>{
            res.json(err)
        })
})
app.put('/tasks/:id',checkSchema(updateValidationSchema),(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(404).json({errors:errors.array()})
    }
    const id=req.params.id
    const body=req.body
    Task.findByIdAndUpdate(id,body,{new:true})
        .then((task)=>{
            if(!task){
                return res.status(400).json({})
            }
            res.json(task)
        })
        .catch((err)=>{
            res.status(500).json('Internal Server Error')
        })

})
app.delete('/tasks/:id',checkSchema(idValidationSchema),(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const id=req.params.id
    Task.findByIdAndDelete(id)
        .then((task)=>{
            if(!task){
                return res.status(400).json({})
            }
            res.json(task)
        })
        .catch((err)=>{
            res.status(500).json('inernal sever error')
        })
})
app.listen(port,()=>{
    console.log(`connect successfully to port ${port}`)
})