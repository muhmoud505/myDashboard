import mongoose from 'mongoose'

const configOptions={
  
    useNewUrlParser:true,
    useUnifiedTopology:true
}


 const connectToDB=async(URL)=>{
  
  await mongoose.connect(URL,{dbName:'myDashboard'}).then(()=>{

    console.log(`Database is connected now `)
  }).catch((err)=>{
        console.log(`error while connecting to DB ${err.message}`)
  })
}

export default connectToDB;
