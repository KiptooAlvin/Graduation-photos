import dims from "./dims.json";

const EXT = "{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG}";
const thumbModules = import.meta.glob("../Assets/photos/thumbs/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG}", { eager: true, import: "default" });
const fullModules = import.meta.glob("../Assets/photos/full/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG}", { eager: true, import: "default" });

const photos = Object.keys(thumbModules)
    .sort()
    .map((path, index) => {
        const fileName = path.split("/").pop();
        const fullPath = Object.keys(fullModules).find(p => p.endsWith("/" + fileName));
        const [width, height] = dims[fileName] || [4, 3];
        return {
            id: index + 1,
            thumb: thumbModules[path],
            full: fullModules[fullPath] || thumbModules[path],
            width,
            height
        };
    });

export default photos;
