import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { db, storage, auth } from "../../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import "./add.css";

function Add() {
  const [legenda, setLegenda] = useState("");
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const [orientation, setOrientation] = useState("vertical");
  const [aspectRatio, setAspectRatio] = useState({ width: 1080, height: 1600 });

  const navigate = useNavigate();

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => setImage(reader.result);
    }
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const getCroppedImg = async (imageSrc, pixelCrop, targetSize) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = targetSize.width;
    canvas.height = targetSize.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetSize.width,
      targetSize.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
    });
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!image || !croppedAreaPixels)
      return alert("Selecione e ajuste a imagem!");

    setLoading(true);

    try {
      const croppedImageBlob = await getCroppedImg(
        image,
        croppedAreaPixels,
        aspectRatio
      );

      const imageRef = ref(storage, `posts/${Date.now()}_post.jpg`);
      await uploadBytes(imageRef, croppedImageBlob);
      const url = await getDownloadURL(imageRef);

      await addDoc(collection(db, "posts"), {
        texto: legenda,
        imageUrl: url,
        orientation: orientation,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });

      alert("Postado com sucesso!");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar postagem.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAspectRatio = () => {
    if (orientation === "vertical") {
      setAspectRatio({ width: 1600, height: 1080 });
      setOrientation("horizontal");
    } else {
      setAspectRatio({ width: 1080, height: 1600 });
      setOrientation("vertical");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box add-post-box">
        <h2>Novo Post ({orientation.toUpperCase()})</h2>

        <form onSubmit={handlePost}>
          <div className="input-group">
            <label>Legenda</label>
            <input
              type="text"
              onChange={(e) => setLegenda(e.target.value)}
              placeholder="Digite uma legenda..."
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="file-upload" className="custom-file-upload">
              {image ? "Trocar Imagem" : "Escolher Foto"}
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={onFileChange}
            />
          </div>

          {image && (
            <div className="crop-wrapper">
              <button
                type="button"
                className="toggle-aspect-btn"
                onClick={toggleAspectRatio}
              >
                Mudar para{" "}
                {orientation === "vertical" ? "Horizontal" : "Vertical"}
              </button>

              <div className="crop-container">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio.width / aspectRatio.height}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="zoom-slider">
                <label>Zoom</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(e.target.value)}
                />
              </div>
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Processando..." : "Publicar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Add;
