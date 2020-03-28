# -*- mode: python ; coding: utf-8 -*-

block_cipher = None


a = Analysis(['Collector.py'],
<<<<<<< HEAD
             pathex=['C:\\Users\\Anthony Haffey\\OneDrive - University of Reading\\Github\\py2rm-collector'],
             binaries=[],
             datas=[('C:\\Users\\Anthony Haffey\\AppData\\Local\\Programs\\Python\\Python36\\lib\\site-packages\\eel\\eel.js', 'eel'), ('web', 'web')],
=======
             pathex=['C:\\Users\\Anthony Haffey\\OneDrive - University of Reading\\Github\\my-collector-new'],
             binaries=[],
             datas=[('C:\\Users\\Anthony Haffey\\AppData\\Local\\Packages\\PythonSoftwareFoundation.Python.3.7_qbz5n2kfra8p0\\LocalCache\\local-packages\\Python37\\site-packages\\eel\\eel.js', 'eel'), ('web', 'web')],
>>>>>>> 94b84c7904574e43669bbc18777b7c6e9dc17b0f
             hiddenimports=['bottle_websocket'],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
<<<<<<< HEAD
          a.binaries,
          a.zipfiles,
          a.datas,
          [],
=======
          [],
          exclude_binaries=True,
>>>>>>> 94b84c7904574e43669bbc18777b7c6e9dc17b0f
          name='Collector',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
<<<<<<< HEAD
          upx_exclude=[],
          runtime_tmpdir=None,
          console=False )
=======
          console=True )
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               upx_exclude=[],
               name='Collector')
>>>>>>> 94b84c7904574e43669bbc18777b7c6e9dc17b0f
