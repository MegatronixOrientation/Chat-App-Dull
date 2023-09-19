from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
import torch
from PIL import Image
import base64

model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
feature_extractor = ViTImageProcessor.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
tokenizer = AutoTokenizer.from_pretrained("nlpconnect/vit-gpt2-image-captioning")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

max_length = 16
num_beams = 4
gen_kwargs = {"max_length": max_length, "num_beams": num_beams}

def predict_step(image_paths):
  images = []
  for image_path in image_paths:
    i_image = Image.open(image_path)
    if i_image.mode != "RGB":
      i_image = i_image.convert(mode="RGB")

    images.append(i_image)

  pixel_values = feature_extractor(images=images, return_tensors="pt").pixel_values
  pixel_values = pixel_values.to(device)

  output_ids = model.generate(pixel_values, **gen_kwargs)

  preds = tokenizer.batch_decode(output_ids, skip_special_tokens=True)
  preds = [pred.strip() for pred in preds]
  return preds

import os

os.rename('base64.txt', 'encode.bin')

with open('encode.bin', 'rb') as file_:
  byte = file_.read()
  byte = str(byte)


ext = byte[byte.index('/')+1 : byte.index('base64')-1]
byte = byte[byte.find(',')+1:]

with open(f'image.{ext}', 'wb') as imagefile:
  imagefile.write(base64.b64decode((byte)))

imageurl = f'image.{ext}'

result = predict_step([imageurl])
caption = result[0]

with open('caption.txt','w') as jsonfile:
  print(caption.title(), file=jsonfile)

os.remove('encode.bin')
os.remove(f'image.{ext}')