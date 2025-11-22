from fastapi import APIRouter, UploadFile, File, HTTPException
from starlette.status import HTTP_200_OK
import os
import uuid
from s3_client import s3, AWS_BUCKET_NAME

upload_router = APIRouter(prefix='/upload', tags=['upload'])

@upload_router.post("/image", status_code=HTTP_200_OK)
async def upload_image(file: UploadFile = File(...)):
    """
    Upload uma imagem PNG para o S3 e retorna a URL pública
    """
    try:
        # Validar se as variáveis de ambiente S3 estão configuradas
        if not AWS_BUCKET_NAME:
            raise HTTPException(status_code=500, detail="Configuração S3 não inicializada. Verifique variáveis de ambiente AWS_BUCKET_NAME")

        # Validar tipo de arquivo
        if file.content_type not in ["image/png", "image/jpeg", "image/jpg"]:
            raise HTTPException(status_code=400, detail="Apenas arquivos PNG e JPG são permitidos")

        # Validar tamanho (máximo 5MB)
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Arquivo muito grande (máximo 5MB)")

        # Gerar nome único para o arquivo
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"anfitrioes/{uuid.uuid4()}{file_extension}"

        # Fazer upload para S3
        s3.put_object(
            Bucket=AWS_BUCKET_NAME,
            Key=unique_filename,
            Body=contents,
            ContentType=file.content_type
        )

        # Construir URL pública do S3
        image_url = f"https://{AWS_BUCKET_NAME}.s3.amazonaws.com/{unique_filename}"

        return {
            "success": True,
            "image_url": image_url,
            "filename": unique_filename
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload: {str(e)}")
