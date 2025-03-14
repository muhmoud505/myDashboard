 import path from 'path';
 import fs from 'fs';
 import { writeFile } from 'fs/promises';
 
 
 //create folder in your project and store files in it
 const createStore=async(file)=>{
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
     const timestamp = Date.now();
        const filename = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
        
        // Ensure upload directory exists
        const publicDir = path.join(process.cwd(), 'public');
        const uploadDir = path.join(publicDir, 'uploads');
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Write the file to the uploads directory
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        
        // Set the image URL to be relative to the public directory
        const imageUrl = `/uploads/${filename}`;
        productData.image = imageUrl;
 }
 



 const url = new URL(request.url);
 const id = url.pathname.split('/').pop(); // Extract ID from /api/product/:id
