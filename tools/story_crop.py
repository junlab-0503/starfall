"""스토리 삽화 시트(프롤로그 6 · 지층 13 · 에필로그 6 = 25장, 기준 1536×1024)를 잘라 art/story/<p1~p6|b1~b13|e1~e6>.webp 로 저장.
사용: python3 tools/story_crop.py <시트 그림> [--preview 미리보기.png]
- 칸 위치는 기준 시트의 좌표를 실제 크기에 맞춰 늘이고, 칸 가장자리의 이름표(밝은 베이지) · 테두리 · 어두운 틈은 자동으로 깎아 낸다.
- 그림 안에는 글자가 없어야 하므로 이름표 줄은 잘라 낸다. 잘린 결과는 --preview 로 한 장에 모아 눈으로 확인할 것."""
import sys,os
from PIL import Image
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(R,'art','story')
W0,H0=1536,1024
ROW1=[(12,254),(269,508),(523,761),(776,1016),(1032,1272),(1288,1526)]
BOX={}
for i,(a,b) in enumerate(ROW1):BOX['p%d'%(i+1)]=(a,72,b,294);BOX['e%d'%(i+1)]=(a,806,b,1010)
for i,(a,b) in enumerate([(12,226),(239,443),(455,660),(673,876),(889,1090),(1102,1304),(1318,1526)]):BOX['b%d'%(i+1)]=(a,372,b,524)
for i,(a,b) in enumerate([(12,248),(262,489),(503,733),(750,983),(999,1246),(1260,1526)]):BOX['b%d'%(i+8)]=(a,570,b,727)
def is_edge(px):   # 이름표(밝은 베이지) · 테두리(아주 어두움 또는 베이지 선)
  r,g,b=px[:3];lum=(r+g+b)/3
  return lum>175 and abs(r-g)<45 and r>=b or lum<22
def trim(im):
  w,h=im.size;P=im.load()
  def row_edge(y):return sum(is_edge(P[x,y]) for x in range(0,w,2))/((w+1)//2)>.6
  def col_edge(x):return sum(is_edge(P[x,y]) for y in range(0,h,2))/((h+1)//2)>.6
  t,b_,l,r=0,h-1,0,w-1
  while t<h//4 and row_edge(t):t+=1
  while b_>h*3//4 and row_edge(b_):b_-=1
  while l<w//4 and col_edge(l):l+=1
  while r>w*3//4 and col_edge(r):r-=1
  return im.crop((l+1,t+1,r,b_))
def main():
  if len(sys.argv)<2:sys.exit(__doc__)
  sh=Image.open(sys.argv[1]).convert('RGB');sx,sy=sh.width/W0,sh.height/H0;os.makedirs(OUT,exist_ok=True);res={}
  for k,(a,t,b,u) in BOX.items():
    im=trim(sh.crop((round(a*sx),round(t*sy),round(b*sx),round(u*sy))));res[k]=im
    im.save(os.path.join(OUT,k+'.webp'),lossless=True,quality=100,method=6)
  print('저장:',len(res),'장 →',OUT,' 크기 예:',{k:res[k].size for k in ('p1','b1','b13','e6')})
  if '--preview' in sys.argv:
    pv=sys.argv[sys.argv.index('--preview')+1];keys=['p%d'%i for i in range(1,7)]+['b%d'%i for i in range(1,14)]+['e%d'%i for i in range(1,7)]
    cw,ch=170,170;cols=7;rows=(len(keys)+cols-1)//cols;c=Image.new('RGB',(cols*cw,rows*ch),(30,20,24))
    for n,k in enumerate(keys):
      im=res[k].copy();im.thumbnail((cw-6,ch-6));c.paste(im,((n%cols)*cw+3,(n//cols)*ch+3))
    c.save(pv);print('미리보기:',pv)
main()
