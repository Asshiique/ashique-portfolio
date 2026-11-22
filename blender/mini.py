import bpy, bmesh, math, random, sys, os
from mathutils import Vector
random.seed(7)
HERE = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)

def mat(name, color, rough=0.6, img=None, emit=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Roughness"].default_value = rough
    if img:
        t = m.node_tree.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(img)
        t.interpolation = 'Closest'
        m.node_tree.links.new(t.outputs["Color"], b.inputs["Base Color"])
    return m

SKIN = mat("skin", (0.30, 0.12, 0.055), 0.5)
SKIN_D = mat("skinD", (0.17, 0.062, 0.028), 0.6)
HAIR = mat("hair", (0.012, 0.010, 0.012), 0.45)
WHITE = mat("eyew", (0.95, 0.94, 0.92), 0.2)
IRIS = mat("iris", (0.05, 0.025, 0.015), 0.15)
SHIRT = mat("shirt", (1, 1, 1), 0.85, img=os.path.join(HERE, "stripes.png"))
PANTS = mat("pants", (0.03, 0.03, 0.035), 0.8)
SOLE = mat("sole", (0.93, 0.92, 0.88), 0.5)
SHOE = mat("shoe", (0.62, 0.53, 0.42), 0.6)
BLACK = mat("black", (0.01, 0.01, 0.012), 0.35)
LIP = mat("lip", (0.33, 0.14, 0.10), 0.5)

def finish(o, m, smooth=True):
    o.data.materials.append(m)
    if smooth:
        for p in o.data.polygons: p.use_smooth = True
    return o

def sphere(name, loc, scale, m, seg=32, rings=16, parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, location=loc)
    o = bpy.context.object; o.name = name; o.scale = scale
    if parent: o.parent = parent; o.matrix_parent_inverse = parent.matrix_world.inverted()
    return finish(o, m)

def cyl(name, loc, r, h, m, parent=None, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=r, depth=h, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name
    if parent: o.parent = parent; o.matrix_parent_inverse = parent.matrix_world.inverted()
    return finish(o, m)

def empty(name, loc, parent=None):
    o = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(o); o.location = loc
    if parent: o.parent = parent
    return o

def tube(name, pts, radius, m, parent=None):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    cu.bevel_depth = radius; cu.bevel_resolution = 4; cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
    for p, c in zip(sp.bezier_points, pts):
        p.co = c; p.handle_left_type = p.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.convert(target='MESH'); o = bpy.context.object
    if parent: o.parent = parent; o.matrix_parent_inverse = parent.matrix_world.inverted()
    return finish(o, m)

# ---------- rig-style hierarchy (pivots so the web app can animate) ----------
NZ = 0.735
root = empty("Root", (0, 0, 0))
body = empty("Body", (0, 0, 0.36), root)          # hips pivot
head = empty("Head", (0, 0, NZ-0.36), body)          # neck pivot (world z .86)

# ---------- HEAD ----------
HZ = NZ + 0.0   # world z of neck; head centre a bit above
hc = (0, 0, NZ + 0.27)
skull = sphere("Skull", hc, (0.285, 0.262, 0.292), SKIN, 48, 24, head)
# jaw/chin mass: slightly narrower lower sphere gives the chibi taper
sphere("Jaw", (0, -0.025, NZ + 0.17), (0.235, 0.215, 0.20), SKIN, 40, 20, head)
# ears
for s in (-1, 1):
    sphere("Ear", (s * 0.283, 0.0, NZ + 0.25), (0.045, 0.03, 0.06), SKIN, 16, 10, head)
    sphere("EarIn", (s * 0.292, -0.004, NZ + 0.25), (0.02, 0.014, 0.034), SKIN_D, 12, 8, head)
# eyes -- big, warm, slightly lidded (the smirk)
EY, EZ, EX = -0.226, NZ + 0.275, 0.098
for s in (-1, 1):
    sphere("EyeW", (s * EX, EY, EZ), (0.066, 0.036, 0.074), WHITE, 24, 14, head)
    sphere("Iris", (s * EX + s * -0.004, EY - 0.024, EZ - 0.004), (0.046, 0.016, 0.052), IRIS, 24, 14, head)
    sphere("Spec", (s * EX + 0.018, EY - 0.036, EZ + 0.022), (0.014, 0.006, 0.016), WHITE, 12, 8, head)
    # upper lid (skin) cutting the eye slightly -> relaxed, confident look
    lid = sphere("Lid", (s * EX, EY - 0.003, EZ + 0.040), (0.066, 0.036, 0.026), SKIN, 24, 12, head)
    # brows: thick, expressive, one a bit raised (smirk)
    lift = 0.012 if s == 1 else 0.0
    tilt = 0.10 if s == 1 else -0.05
    tube("Brow", [(s * (EX + 0.068), EY - 0.012, EZ + 0.092 + lift - 0.012 * s * 0),
                  (s * (EX + 0.0), EY - 0.030, EZ + 0.108 + lift + tilt * 0.1),
                  (s * (EX - 0.062), EY - 0.020, EZ + 0.088 + lift)], 0.017, HAIR, head)
# nose
sphere("Nose", (0, -0.262, NZ + 0.215), (0.036, 0.034, 0.034), SKIN, 20, 12, head)
sphere("NoseTip", (0, -0.282, NZ + 0.202), (0.034, 0.028, 0.026), SKIN, 20, 12, head)
for s in (-1, 1):
    sphere("Nostril", (s * 0.019, -0.296, NZ + 0.192), (0.009, 0.006, 0.006), SKIN_D, 8, 6, head)
# cheeks (the happy bulge)
for s in (-1, 1):
    sphere("Cheek", (s * 0.135, -0.205, NZ + 0.145), (0.075, 0.05, 0.065), SKIN, 20, 12, head)
# smirk: mouth line, bent up on one side
tube("Mouth", [(-0.062, -0.254, NZ + 0.108), (-0.02, -0.262, NZ + 0.098),
               (0.030, -0.262, NZ + 0.100), (0.082, -0.248, NZ + 0.128)], 0.0075, LIP, head)
tube("MouthDimple", [(0.088, -0.246, NZ + 0.140), (0.094, -0.243, NZ + 0.122)], 0.006, SKIN_D, head)
# MUSTACHE (thick, slightly wavy) + soul patch
tube("Mustache", [(-0.100, -0.240, NZ + 0.130), (-0.050, -0.268, NZ + 0.146),
                  (0.0, -0.272, NZ + 0.132), (0.050, -0.268, NZ + 0.146), (0.100, -0.240, NZ + 0.132)], 0.020, HAIR, head)
sphere("SoulPatch", (0.0, -0.240, NZ + 0.070), (0.026, 0.016, 0.030), HAIR, 16, 10, head)

# BEARD: shell of the face lower part, pushed out slightly
bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=1)
bm.verts.ensure_lookup_table()
keep = []
for f in bm.faces:
    c = f.calc_center_median()
    ok = (c.z < -0.52 and c.y < 0.12) or (abs(c.x) > 0.90 and -0.05 < c.z < 0.30 and c.y < 0.2)
    if ok and -0.66 < c.z < -0.40 and abs(c.x) < 0.30 and c.y < -0.5: ok = False
    if not ok: keep.append(f)
bmesh.ops.delete(bm, geom=keep, context='FACES')
me = bpy.data.meshes.new("BeardM"); bm.to_mesh(me); bm.free()
beard = bpy.data.objects.new("Beard", me); bpy.context.collection.objects.link(beard)
beard.location = (0, -0.012, NZ + 0.255); beard.scale = (0.298, 0.272, 0.298)
beard.parent = head; beard.matrix_parent_inverse = head.matrix_world.inverted()
sol = beard.modifiers.new("s", 'SOLIDIFY'); sol.thickness = 0.012; sol.offset = 1
beard.data.materials.append(HAIR)
bpy.context.view_layer.objects.active = beard; bpy.ops.object.modifier_apply(modifier="s")
for p in beard.data.polygons: p.use_smooth = True
# stubble chin cushion
sphere("Chin", (0, -0.20, NZ + 0.045), (0.105, 0.065, 0.062), HAIR, 24, 12, head)

# ---------- CURLY HAIR ----------
sphere("HairCap", (0, 0.06, NZ + 0.34), (0.292, 0.262, 0.255), HAIR, 40, 20, head)
curls = []
def add_curl(theta, phi, r, push=1.0):
    # theta: around Z (0 = front/-Y), phi: from top
    cx, cy, cz = 0.0, 0.01, NZ + 0.30
    rx, ry, rz = 0.30, 0.28, 0.29
    x = cx + rx * push * math.sin(phi) * math.sin(theta)
    y = cy - ry * push * math.sin(phi) * math.cos(theta)
    z = cz + rz * push * math.cos(phi)
    s = r * random.uniform(0.85, 1.2)
    o = sphere("Curl", (x, y, z), (s, s * random.uniform(0.9, 1.15), s * random.uniform(0.85, 1.1)), HAIR, 14, 8, head)
    o.rotation_euler = (random.random() * 3, random.random() * 3, random.random() * 3)
# rings of curls from crown downwards
for phi_deg, n, r in [(8, 8, 0.06), (22, 14, 0.055), (38, 22, 0.053), (54, 28, 0.052), (70, 32, 0.05), (86, 32, 0.05), (100, 26, 0.05), (112, 20, 0.05)]:
    for i in range(n):
        th = (i / n) * 2 * math.pi + random.uniform(-0.12, 0.12)
        # keep the face clear: front arc (theta ~ 0) only upper rows
        face = abs(((th + math.pi) % (2 * math.pi)) - math.pi) < 0.95
        if face and phi_deg > 62: continue
        add_curl(th, math.radians(phi_deg + random.uniform(-4, 4)), r, random.uniform(0.98, 1.1))
# forehead fringe: curls falling over the brow on the right side (reference has a lock)
for i in range(7):
    th = -0.62 + i * 0.2 + random.uniform(-.03, .03)
    add_curl(th, math.radians(random.uniform(56, 63)), 0.040, 1.02)
for th, ph in [(-0.9, 70), (0.7, 68), (-1.1, 82), (1.0, 80), (-1.3, 96), (1.25, 96), (-1.0, 66)]:
    add_curl(th, math.radians(ph), 0.04, 1.0)
# nape + back volume
for i in range(10):
    th = math.pi + (i - 4.5) * 0.28
    add_curl(th, math.radians(random.uniform(100, 118)), 0.06, 1.0)

# ---------- BODY ----------
torso = sphere("Torso", (0, 0, 0.36 + 0.14), (0.205, 0.165, 0.215), SHIRT, 40, 24, body)
# collar ring
bpy.ops.mesh.primitive_torus_add(major_radius=0.075, minor_radius=0.014, location=(0, -0.005, 0.36 + 0.335))
c = bpy.context.object; c.name = "Collar"; c.parent = body; c.matrix_parent_inverse = body.matrix_world.inverted(); finish(c, BLACK)
sphere("Neck", (0, 0, 0.36 + 0.345), (0.075, 0.07, 0.07), SKIN, 20, 12, body)
# hips
sphere("Hips", (0, 0, 0.36 + 0.00), (0.185, 0.15, 0.12), PANTS, 32, 16, body)
# arms: pivot at shoulder, rig empties
def arm(side):
    s = 1 if side == "R" else -1
    sh = empty("Arm" + side, (s * 0.215, 0, 0.36 + 0.27), body)
    sph = sphere("Sleeve", (s * 0.215, 0, 0.36 + 0.265), (0.082, 0.082, 0.082), SHIRT, 20, 12, sh)
    sl = cyl("Sleeve2", (s * 0.238, 0, 0.36 + 0.22), 0.074, 0.11, SHIRT, sh, rot=(0, s * 0.35, 0))
    cuff = sphere("Cuff", (s * 0.262, 0, 0.36 + 0.17), (0.07, 0.07, 0.03), BLACK, 16, 8, sh)
    fa = cyl("Forearm", (s * 0.272, 0, 0.36 + 0.10), 0.043, 0.16, SKIN, sh, rot=(0, s * 0.18, 0))
    sphere("Hand", (s * 0.285, 0, 0.36 + 0.005), (0.056, 0.048, 0.06), SKIN, 20, 12, sh)
    if side == "L":
        bpy.ops.mesh.primitive_torus_add(major_radius=0.044, minor_radius=0.012, location=(s * 0.279, 0, 0.36 + 0.055))
        w = bpy.context.object; w.name = "Watch"; w.parent = sh; w.matrix_parent_inverse = sh.matrix_world.inverted(); finish(w, BLACK)
        sphere("WatchFace", (s * 0.279, -0.04, 0.36 + 0.055), (0.036, 0.012, 0.036), BLACK, 16, 8, sh)
    return sh
armR = arm("R"); armL = arm("L")

# legs + sneakers
def leg(side):
    s = 1 if side == "R" else -1
    lg = empty("Leg" + side, (s * 0.085, 0, 0.36 - 0.02), body)
    cyl("Pant", (s * 0.088, 0, 0.36 - 0.12), 0.078, 0.22, PANTS, lg)
    sphere("PantCuff", (s * 0.088, 0, 0.36 - 0.225), (0.083, 0.083, 0.04), PANTS, 20, 10, lg)
    sphere("Pocket", (s * 0.158, -0.015, 0.36 - 0.12), (0.022, 0.05, 0.05), PANTS, 12, 8, lg)
    sphere("Shoe", (s * 0.09, -0.04, 0.08), (0.088, 0.15, 0.065), SHOE, 24, 14, lg)
    sphere("ShoeToe", (s * 0.09, -0.115, 0.07), (0.080, 0.08, 0.052), SOLE, 20, 12, lg)
    sphere("Sole", (s * 0.09, -0.035, 0.032), (0.094, 0.165, 0.032), SOLE, 24, 10, lg)
    sphere("Swoosh", (s * 0.17 * 0.6 + s * 0.04, -0.04, 0.10), (0.010, 0.07, 0.022), BLACK, 12, 6, lg)
leg("R"); leg("L")

# ---------- ground contact shadow disc kept out; export ----------
# Lights/camera only for preview renders
mode = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "render"
if mode == "export":
    # face + hair come from the real 3D portrait texture in the web app; keep only the back-of-head volume
    DROP = ("Eye","Iris","Spec","Lid","Brow","Nose","Nostril","Cheek","Mouth","Mustache","SoulPatch","Beard","Chin","Ear","Jaw","Curl")
    for o in list(bpy.data.objects):
        if o.name.startswith(DROP): bpy.data.objects.remove(o, do_unlink=True)
    for o in bpy.data.objects:
        if o.name.startswith(("Skull","HairCap")): o.data.materials.clear(); o.data.materials.append(HAIR)
    out = os.path.join(HERE, "..", "public", "models", "mini-ashique.glb")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, use_selection=False,
                              export_cameras=False, export_lights=False, export_yup=True)
    print("EXPORTED", out)
else:
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_EEVEE' if 'BLENDER_EEVEE' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE_NEXT'
    sc.view_settings.view_transform = 'Standard'; sc.render.resolution_x = 900; sc.render.resolution_y = 900
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.16, 0.12, 0.10, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 1.0
    for nm, loc, e, col in [("k", (-1.5, -2.2, 2.0), 220, (1, .9, .8)), ("f", (2, -1.5, 1.0), 90, (.7, .8, 1)), ("r", (0, 2, 2.2), 200, (1, .6, .3))]:
        L = bpy.data.lights.new(nm, 'AREA'); L.energy = e; L.color = col; L.size = 1.5
        lo = bpy.data.objects.new(nm, L); lo.location = loc; sc.collection.objects.link(lo)
        d = Vector((0, 0, 0.7)) - lo.location; lo.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    cam = bpy.data.cameras.new("c"); cam.lens = 70; co = bpy.data.objects.new("c", cam); sc.collection.objects.link(co); sc.camera = co
    shots = {"front_head": ((0, -1.6, 1.15), (0, 0, 1.1)), "full": ((0, -3.2, 0.75), (0, 0, 0.55)), "three_q": ((-1.0, -1.4, 1.2), (0, 0, 1.08))}
    for k, (cl, tg) in shots.items():
        co.location = cl; co.rotation_euler = (Vector(tg) - Vector(cl)).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(HERE, f"prev_{k}.png"); bpy.ops.render.render(write_still=True)
