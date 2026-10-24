import sys,glob
from PIL import Image
name, cols = sys.argv[1], int(sys.argv[2]) if len(sys.argv)>2 else 4
fs=sorted(glob.glob(f'seq/{name}-*.jpg'))
ims=[Image.open(f) for f in fs]; w,h=ims[0].size
rows=(len(ims)+cols-1)//cols
s=Image.new('RGB',(cols*w,rows*h))
for k,im in enumerate(ims): s.paste(im,((k%cols)*w,(k//cols)*h))
s=s.resize((s.width*1600//s.width, s.height*1600//s.width)); s.save(f'seq/{name}-sheet.jpg',quality=70)
