function GalleryItem({ photo, setSelectedPhoto }) {

    return (

        <div
            className="gallery-item"
            onClick={() => setSelectedPhoto(photo)}
        >

            <img
                src={photo.thumb}
                alt="Event"
                loading="lazy"
            />

        </div>

    );

}

export default GalleryItem;