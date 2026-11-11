"""사용자 그림(art/source/sprites/) → 게임용 도트 (art/sprites, art/ui, art/scene/tower.png)
  robot_cat.webp : 드릴 로봇 켜짐 · 꺼짐 · 가득 × 3, 숯(앉기 · 꼬리 · 잠), 선물 상자
  ui_icons.webp  : 아래 탭 6개(채굴 · [장비 자리의 굴착기는 안 쓰고 우리 드릴 로봇] · 재련 · 장터 · 탑 · 관리), 로봇 보관함 · 숯의 선물 · 채굴 2배 (검은 바탕은 지움)
  shop_emoji.webp: 장비 탭 가게 무대에 서는 사람(핀 · 무쇠 · 루카 · 미르 · 셈) → art/shop/<키>.png, 높이 192(화면 1:1)
  tower.webp     : 탑 (흰 바탕은 지움)
크기는 "화면 픽셀"(게임 월드 1px = 화면 2px) 기준. 사용: python3 tools/sprite_art.py"""
from PIL import Image
import numpy as np
from collections import Counter
SRC='art/source/sprites/'
def runs(v,th,gap):
    o=[];s=None;last=-99
    for i,x in enumerate(list(v>th)+[False]):
        if x and s is None:s=i
        if x:last=i
        if not x and s is not None and i-last>gap:o.append((s,last+1));s=None
    if s is not None:o.append((s,last+1))
    return o
def pixelate(rgba,H):
    """높이 H로 줄이기: 칸마다 가장 많은 색(어두운 윤곽은 30%만 넘어도 우선), 반 이상 투명하면 투명"""
    a=rgba.astype(float);m=a[...,3]>128;h,w=m.shape;W=max(1,round(w*H/h))
    px=a[m][:,:3];pq=Image.fromarray(px.reshape(1,-1,3).astype(np.uint8)).quantize(64,method=Image.Quantize.MEDIANCUT)
    pal=np.array(pq.getpalette()[:64*3]).reshape(-1,3).astype(float);luma=pal@[.3,.59,.11]
    idx=np.zeros(m.shape,int)
    for y0 in range(0,h,128):idx[y0:y0+128]=((a[y0:y0+128,:,None,:3]-pal)**2).sum(-1).argmin(-1)
    res=np.zeros((H,W,4),np.uint8)
    for j in range(H):
        ya,yb=j*h//H,max(j*h//H+1,(j+1)*h//H)
        for i in range(W):
            xa,xb=i*w//W,max(i*w//W+1,(i+1)*w//W);cm=m[ya:yb,xa:xb]
            if cm.sum()<cm.size*.45:continue
            cnt=Counter(idx[ya:yb,xa:xb][cm].tolist());n=sum(cnt.values());dk=[q for q in cnt if luma[q]<45]
            q=max(dk,key=lambda q:cnt[q]) if dk and sum(cnt[q] for q in dk)>=n*.3 else cnt.most_common(1)[0][0]
            res[j,i,:3]=pal[q];res[j,i,3]=255
    return res
def crop(a,box):
    x0,y0,x1,y1=box;sub=a[y0:y1,x0:x1];ys,xs=np.where(sub[...,3]>100);return sub[ys.min():ys.max()+1,xs.min():xs.max()+1]
def save(arr,path):Image.fromarray(arr).quantize(64,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).save(path,optimize=True);print(path,arr.shape[1],'x',arr.shape[0])

# 1) 로봇 · 고양이 · 선물
a=np.asarray(Image.open(SRC+'robot_cat.webp').convert('RGBA'));op=a[...,3]>100
rows=runs(op.mean(1),.002,8)   # 4줄
names=[['robot_on1','robot_on2','robot_on3'],['robot_off1','robot_off2','robot_off3'],['robot_full1','robot_full2','robot_full3'],['cat_sit','cat_tail','cat_sleep','gift']]
H={'robot':36,'cat_sit':36,'cat_tail':40,'cat_sleep':24,'gift':24}
for (y0,y1),nm in zip(rows,names):
    cols=runs(op[y0:y1].mean(0),.002,25)
    for (x0,x1),n in zip(cols,nm):
        c=crop(a,(x0,y0,x1,y1));hh=H['robot'] if n.startswith('robot') else H[n]
        # 로봇은 불꽃 · 경광등 때문에 높이가 달라서 몸통 높이로 맞춤(몸통 = 아래 190px쯤)
        save(pixelate(c,round(hh*c.shape[0]/190) if n.startswith('robot') else hh),f'art/sprites/{n}.png')
# 2) UI 아이콘: 검은 바탕(가장자리에서 이어진 아주 어두운 부분)을 지움
a=np.asarray(Image.open(SRC+'ui_icons.webp').convert('RGBA')).copy();dark=a[...,:3].astype(int).sum(2)<45
seed=np.zeros_like(dark);seed[0]=seed[-1]=seed[:,0]=seed[:,-1]=True;cur=seed&dark
while True:
    d=cur.copy();d[1:]|=cur[:-1];d[:-1]|=cur[1:];d[:,1:]|=cur[:,:-1];d[:,:-1]|=cur[:,1:];d&=dark
    if (d==cur).all():break
    cur=d
a[cur,3]=0;op=a[...,3]>100
rows=runs(op.mean(1),.002,8)
for (x0,x1),n in zip(runs(op[rows[0][0]:rows[0][1]].mean(0),.002,6),['mine','equip_x','forge','market','tower','manage']):
    if n=='equip_x':continue      # 굴착기 → 장비 탭은 우리 드릴 로봇으로(아래)
    save(pixelate(crop(a,(x0,rows[0][0],x1,rows[0][1])),64),f'art/ui/nav_{n}.png')
for (x0,x1),(n,h) in zip(runs(op[rows[1][0]:rows[1][1]].mean(0),.002,25),[('box',96),('gift',112),('ff',112)]):
    save(pixelate(crop(a,(x0,rows[1][0],x1,rows[1][1])),h),f'art/ui/{n}.png')
# 장비 탭 아이콘 = 우리 드릴 로봇(로봇 그림의 꺼짐 1번)을 64px 칸에 맞춤
rc=np.asarray(Image.open(SRC+'robot_cat.webp').convert('RGBA'));op2=rc[...,3]>100;r2=runs(op2.mean(1),.002,8)[1];c2=runs(op2[r2[0]:r2[1]].mean(0),.002,25)[0]
rb=crop(rc,(c2[0],r2[0],c2[1],r2[1]));px=pixelate(rb,round(64*rb.shape[0]/rb.shape[1]));cv=np.zeros((64,64,4),np.uint8);oy=(64-px.shape[0])//2;cv[oy:oy+px.shape[0],:px.shape[1]]=px[:, :64]
save(cv,'art/ui/nav_equip.png')
# 가게 무대 사람: 다섯 명(위 줄 핀 · 무쇠 · 루카, 아래 줄 미르 · 셈), 높이 192px
e=np.asarray(Image.open(SRC+'shop_emoji.webp').convert('RGBA'));op3=e[...,3]>100;rr=runs(op3.mean(1),.002,8)
keys=[['pin','musoe','luka'],['mir','sem']]
# 위 줄은 세 사람이 맞닿아 있어 가장 덜 겹친 세로줄(545 · 970 근처)에서 나눔
def split(y0,y1,n):
    c=(e[y0:y1,:,3]>100).sum(0);xs=np.where(c>0)[0];a,b=xs.min(),xs.max()+1;cuts=[a]
    for k in range(1,n):
        m=a+(b-a)*k//n;lo,hi=m-110,m+110;cuts.append(lo+int(np.argmin(c[lo:hi])))
    return list(zip(cuts,cuts[1:]+[b]))
for (y0,y1),ks in zip(rr,keys):
    for (x0,x1),k in zip(split(y0,y1,len(ks)),ks):
        sub=e[y0:y1,x0:x1].copy()
        # 옆 사람 조각이 붙어 들어오면 지움: 가장 큰 덩어리만 남김(4방향 연결)
        m=sub[...,3]>100;lab=np.zeros(m.shape,int);cur=0
        from collections import deque
        for yy,xx in zip(*np.where(m)):
            if lab[yy,xx]:continue
            cur+=1;q=deque([(yy,xx)]);lab[yy,xx]=cur
            while q:
                y_,x_=q.popleft()
                for dy,dx in((1,0),(-1,0),(0,1),(0,-1)):
                    ny,nx=y_+dy,x_+dx
                    if 0<=ny<m.shape[0] and 0<=nx<m.shape[1] and m[ny,nx] and not lab[ny,nx]:lab[ny,nx]=cur;q.append((ny,nx))
        big=np.bincount(lab.ravel())[1:];keep=np.argsort(-big)[:3]+1;keep=[kk for kk in keep if big[kk-1]>big.max()*.03]   # 큰 덩어리 + 붙은 장식(느낌표 등)
        sub[~np.isin(lab,keep),3]=0
        ys,xs=np.where(sub[...,3]>100);sub=sub[ys.min():ys.max()+1,xs.min():xs.max()+1]
        save(pixelate(sub,192),f'art/shop/{k}.png')
# 3) 탑: 가장자리에서 이어진 흰 바탕만 지움
a=np.asarray(Image.open(SRC+'tower.webp').convert('RGBA')).copy();rgb=a[...,:3].astype(int);light=(rgb.min(2)>228)
seed=np.zeros_like(light);seed[0]=seed[-1]=seed[:,0]=seed[:,-1]=True;cur=seed&light
while True:
    d=cur.copy();d[1:]|=cur[:-1];d[:-1]|=cur[1:];d[:,1:]|=cur[:,:-1];d[:,:-1]|=cur[:,1:];d&=light
    if (d==cur).all():break
    cur=d
# 다른 도트(주인공 · 로봇 · 숯 = 그림 1px ≈ 화면 1px)보다 너무 촘촘해 보이지 않게 조금 굵은 도트로(높이 TOWER_H=200, 게임에서 330 높이로 키워 그림), 색도 48가지로
import os
TOWER_H=int(os.environ.get('TOWER_H','200'))
a[cur,3]=0;tw=pixelate(crop(a,(0,0,a.shape[1],a.shape[0])),TOWER_H);Image.fromarray(tw).quantize(48,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).save('art/scene/tower.png',optimize=True);print('art/scene/tower.png',tw.shape[1],'x',tw.shape[0])
