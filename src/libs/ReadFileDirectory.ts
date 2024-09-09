import fs from 'fs'

export const ReadFileDirectory = (dirPath: string) => {
    const img: string[] = []
    try {
        fs.readdirSync(dirPath).forEach(file => {
            img.push(file)
        })
    } catch (error) {
        console.error(error);
        
    }
    return img[Math.floor(Math.random() * img.length)]
}