const thumbModules = import.meta.glob(
    "../Assets/photos/thumbs/*.{jpg,jpeg,png,JPG,JPEG,PNG}",
    {
        eager: true,
        import: "default"
    }
);

const fullModules = import.meta.glob(
    "../Assets/photos/full/*.{jpg,jpeg,png,JPG,JPEG,PNG}",
    {
        eager: true,
        import: "default"
    }
);

const photos = Object.keys(thumbModules)
    .sort()
    .map((path, index) => {

        const fileName = path.split("/").pop();

        const fullPath = Object.keys(fullModules).find(
            p => p.endsWith(fileName)
        );

        return {
            id: index + 1,
            thumb: thumbModules[path],
            full: fullModules[fullPath]
        };
    });

export default photos;