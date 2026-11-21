별빛광맥 앱 아이콘 세트 (원본: art/icon/source.webp, 다시 만들기: python3 tools/make_icons.py)

1) 플레이 스토어(Play Console > 기본 스토어 등록정보 > 앱 아이콘)
   play_store_512.png  — 512×512 꽉 찬 정사각형. 스토어가 모서리를 둥글게 깎아 보여 주므로 모서리를 그림으로 채워 둠

2) 안드로이드 앱(Capacitor 프로젝트) — 둘 중 하나
   가) android_res 폴더 안의 것들을 android/app/src/main/res/ 에 그대로 덮어쓰기
       mipmap-*/ic_launcher.png(둥근 네모) · ic_launcher_round.png(동그라미) · ic_launcher_foreground.png(적응형 앞층)
       mipmap-anydpi-v26/ic_launcher.xml · ic_launcher_round.xml(적응형 아이콘), values/ic_launcher_background.xml(뒷층 색)
   나) capacitor_assets 폴더 이름을 assets 로 바꿔 프로젝트 맨 위에 두고
       npx @capacitor/assets generate --android

3) preview.png — 스토어 · 동그라미 · 둥근 네모 · 물방울 런처 · 옛 런처에서 보이는 모양
4) web_icon.webp — 게임 HTML(dist/starfall.html) 브라우저 탭 아이콘으로 이미 들어가 있음
