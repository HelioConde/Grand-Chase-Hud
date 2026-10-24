"""Experimental automatic armature for original Grand Chase OBJ assets.
Run with Blender 4.x/5.x:
  blender -b -t 4 --python tools/rig_character.py -- --character elesis
Outputs models/<character>/<character>_rigged.glb and a diagnostic .blend.
Review the generated bones and deformation in Blender before publishing.
"""
import bpy, sys, argparse, math
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
def args():
    p=argparse.ArgumentParser()
    p.add_argument("--character",choices=("elesis","lire","arme","lass"),default="elesis")
    return p.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else [])
cfg=args()
names={"elesis":"Elesis","lire":"Lire","arme":"arme","lass":"Lass"}
folder=ROOT/"models"/cfg.character
src=folder/(names[cfg.character]+".obj")
if not src.is_file(): raise SystemExit("Arquivo não encontrado: "+str(src))
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
# OBJ files contain static geometry; Blender must create a new armature and weights.
try: bpy.ops.wm.obj_import(filepath=str(src),forward_axis='Y',up_axis='Z')
except (AttributeError,TypeError):
    bpy.ops.import_scene.obj(filepath=str(src),axis_forward='Y',axis_up='Z')
meshes=[obj for obj in bpy.context.selected_objects if obj.type=="MESH"]
if not meshes: raise SystemExit("Nenhuma malha importada")
for obj in meshes:
    bpy.context.view_layer.objects.active=obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
    obj.select_set(False)
coords=[obj.matrix_world@Vector(corner) for obj in meshes for corner in obj.bound_box]
mn=Vector([min(v[i] for v in coords) for i in range(3)])
mx=Vector([max(v[i] for v in coords) for i in range(3)])
center=(mn+mx)*.5; tall=mx.z-mn.z
if tall<=0.001: raise SystemExit("Malha inválida; verifique orientação do OBJ")
# Approximate humanoid landmarks derived from dimensions; require artist review.
def pt(x,y,z):return (center.x+x*(mx.x-mn.x),center.y+y*(mx.y-mn.y),mn.z+z*tall)
bones={
 "root":(pt(0,0,.03),pt(0,0,.48),None),
 "spine":(pt(0,0,.48),pt(0,0,.71),"root"),
 "neck":(pt(0,0,.71),pt(0,0,.85),"spine"),
 "head":(pt(0,0,.85),pt(0,0,.99),"neck"),
 "upper_arm.L":(pt(-.19,0,.70),pt(-.39,0,.56),"spine"),
 "forearm.L":(pt(-.39,0,.56),pt(-.45,0,.40),"upper_arm.L"),
 "upper_arm.R":(pt(.19,0,.70),pt(.39,0,.56),"spine"),
 "forearm.R":(pt(.39,0,.56),pt(.45,0,.40),"upper_arm.R"),
 "thigh.L":(pt(-.10,0,.47),pt(-.10,0,.27),"root"),
 "shin.L":(pt(-.10,0,.27),pt(-.10,0,.055),"thigh.L"),
 "thigh.R":(pt(.10,0,.47),pt(.10,0,.27),"root"),
 "shin.R":(pt(.10,0,.27),pt(.10,0,.055),"thigh.R")
}
arm_data=bpy.data.armatures.new("GC_Armature")
rig=bpy.data.objects.new("GC_Rig",arm_data)
bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active=rig
rig.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
for name,(head,tail,parent) in bones.items():
    bone=arm_data.edit_bones.new(name);bone.head=head;bone.tail=tail
for name,(_,_,parent) in bones.items():
    if parent:arm_data.edit_bones[name].parent=arm_data.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT')
rig.select_set(False)
# Automatic weights through Blender's bone heat algorithm.
for mesh in meshes:
    mesh.select_set(True)
rig.select_set(True)
bpy.context.view_layer.objects.active=rig
try:
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')
except RuntimeError as exc:
    print("Aviso: pesos automáticos falharam:",exc)
    for obj in meshes:
        if not any(m.type=='ARMATURE' for m in obj.modifiers):
            mod=obj.modifiers.new("GC_Armature","ARMATURE");mod.object=rig
            obj.parent=rig
rig.select_set(False)
for mesh in meshes: mesh.select_set(False)
# Minimal animation clips using simple bone rotations.
def action(name,frames,poses):
    act=bpy.data.actions.new(name)
    rig.animation_data_create()
    rig.animation_data.action=act
    for f in frames:
        for pb in rig.pose.bones:
            pb.rotation_mode='XYZ'
            pb.rotation_euler=(0,0,0)
        for bn,rot in poses.get(f,{}).items():
            if bn in rig.pose.bones: rig.pose.bones[bn].rotation_euler=rot
        for pb in rig.pose.bones:
            pb.keyframe_insert(data_path='rotation_euler',frame=f,group=pb.name)
    rig.animation_data.action=None
    return act
idle=action('Idle',[1,15,30],{15:{"spine":(.025,0,0)}})
walk=action('Walk',[1,7,13,19,25],{
  1:{"thigh.L":(.42,0,0),"thigh.R":(-.42,0,0),"upper_arm.L":(-.32,0,0),"upper_arm.R":(.32,0,0)},
  7:{"thigh.L":(0,0,0),"thigh.R":(0,0,0)},
  13:{"thigh.L":(-.42,0,0),"thigh.R":(.42,0,0),"upper_arm.L":(.32,0,0),"upper_arm.R":(-.32,0,0)},
  19:{"thigh.L":(0,0,0),"thigh.R":(0,0,0)},
  25:{"thigh.L":(.42,0,0),"thigh.R":(-.42,0,0),"upper_arm.L":(-.32,0,0),"upper_arm.R":(.32,0,0)}})
attack=action('Attack',[1,8,16,24],{8:{"spine":(0,0,.22),"upper_arm.R":(-.9,0,.3)},16:{"spine":(0,0,-.12),"upper_arm.R":(.6,0,-.5)}})
for act in (idle,walk,attack):
    track=rig.animation_data.nla_tracks.new()
    track.name=act.name;strip=track.strips.new(act.name,1,act)
    strip.action_frame_start=1;strip.action_frame_end=30 if act==idle else 25 if act==walk else 24
rig.animation_data.action=None
bpy.ops.wm.save_as_mainfile(filepath=str(folder/(cfg.character+"_rig_review.blend")))
bpy.ops.export_scene.gltf(filepath=str(folder/(cfg.character+"_rigged.glb")),export_format='GLB',export_animations=True,export_nla_strips=True,export_yup=True)
print("Rig experimental salvo; revise pesos/ossos/animações no Blender.")
