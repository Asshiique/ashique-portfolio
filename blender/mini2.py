import bpy, bmesh, math, random, sys, os
from mathutils import Vector
random.seed(11)
HERE = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)

def mat(name, color, rough=0.55, img=None, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if img:
        t = m.node_tree.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(img); t.interpolation = 'Closest'
        m.node_tree.links.new(t.outputs["Color"], b.inputs["Base Color"])
    return m

SKIN = mat("skin", (0.5, 0.26, 0.17), 0.5)
SKIN_D = mat("skinD", (0.3, 0.13, 0.08), 0.6)
LIPM = mat("lip", (0.38, 0.14, 0.1), 0.45)
HAIR = mat("hair", (0.012, 0.01, 0.012), 0.32)
WHITE = mat("eyew", (0.9, 0.88, 0.85), 0.2)
IRIS = mat("iris", (0.06, 0.03, 0.018), 0.12)
SHIRT = mat("shirt", (1, 1, 1), 0.9, img=os.path.join(HERE, "stripes.png"))
BLACK = mat("black", (0.012, 0.012, 0.014), 0.35)
PANTS = mat("pants", (0.035, 0.035, 0.04), 0.85)
CREAM = mat("cream", (0.42, 0.32, 0.22), 0.6)
WHITEL = mat("sole", (0.88, 0.86, 0.82), 0.5)
GOLD = mat("gold", (0.8, 0.55, 0.2), 0.3, metal=0.8)

def fin(o, m):
    o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = True
    return o
def par(o, p):
    if p: o.parent = p; o.matrix_parent_inverse = p.matrix_world.inverted()
    return o
def sphere(name, loc, sc, m, p, seg=32, ring=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ring, location=loc)
    o = bpy.context.object; o.name = name; o.scale = sc; return fin(par(o, p), m)
def box(name, loc, sc, m, p, rot=(0, 0, 0), bevel=0.012):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot); o = bpy.context.object; o.name = name; o.scale = sc
    bpy.ops.object.transform_apply(scale=True)
    b = o.modifiers.new("b", 'BEVEL'); b.width = bevel; b.segments = 3
    bpy.ops.object.modifier_apply(modifier="b"); return fin(par(o, p), m)
def cyl(name, loc, r, h, m, p, rot=(0, 0, 0), r2=None):
    bpy.ops.mesh.primitive_cone_add(vertices=28, radius1=r, radius2=(r if r2 is None else r2), depth=h, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; return fin(par(o, p), m)
def empty(name, loc, p=None):
    o = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(o); o.location = loc
    if p: o.parent = p
    return o
def tube(name, pts, rad, m, p, taper=False):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = rad; cu.bevel_resolution = 5; cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
    for q, c in zip(sp.bezier_points, pts): q.co = c; q.handle_left_type = q.handle_right_type = 'AUTO'
    if taper:
        for i, q in enumerate(sp.bezier_points): q.radius = 1.0 - 0.55 * (i / max(1, len(pts) - 1))
    o = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o; o.select_set(True); bpy.ops.object.convert(target='MESH'); o = bpy.context.object
    return fin(par(o, p), m)

NZ = 0.74                      # neck height
root = empty("Root", (0, 0, 0)); body = empty("Body", (0, 0, 0.36), root); head = empty("Head", (0, 0, NZ - 0.36), body)
HZ = NZ + 0.265                # head centre

# ---------------- HEAD (handsome: strong jaw, calm eyes, neat beard) ----------------
sphere("Skull", (0, 0, HZ), (0.250, 0.240, 0.280), SKIN, head, 56, 28)
sphere("Jaw", (0, -0.028, HZ - 0.115), (0.186, 0.195, 0.185), SKIN, head, 48, 24)
sphere("ChinB", (0, -0.150, HZ - 0.185), (0.082, 0.07, 0.07), SKIN, head, 24, 12)
for s in (-1, 1):
    sphere("Ear", (s * 0.272, 0.004, HZ - 0.005), (0.04, 0.026, 0.056), SKIN, head, 20, 12)
    sphere("EarIn", (s * 0.280, -0.002, HZ - 0.005), (0.018, 0.012, 0.03), SKIN_D, head, 12, 8)
EY, EZ, EX = -0.218, HZ + 0.025, 0.096
for s in (-1, 1):
    sphere("EyeW", (s * EX, EY, EZ), (0.05, 0.028, 0.054), WHITE, head, 24, 14)
    sphere("Iris", (s * EX - s * 0.003, EY - 0.018, EZ - 0.002), (0.036, 0.014, 0.04), IRIS, head, 24, 14)
    sphere("Spec", (s * EX + 0.013, EY - 0.028, EZ + 0.015), (0.01, 0.005, 0.012), WHITE, head, 10, 6)
    sphere("LidU", (s * EX, EY - 0.002, EZ + 0.034), (0.054, 0.03, 0.02), SKIN, head, 24, 12)
    sphere("LidL", (s * EX, EY + 0.001, EZ - 0.036), (0.048, 0.026, 0.014), SKIN, head, 20, 10)
    lift = 0.01 if s == 1 else 0.0
    tube("Brow", [(s * (EX + 0.062), EY + 0.002, EZ + 0.074 + lift), (s * (EX + 0.01), EY - 0.020, EZ + 0.082 + lift), (s * (EX - 0.060), EY - 0.012, EZ + 0.066 + lift * 0.3)], 0.016, HAIR, head, taper=True)
sphere("NoseBr", (0, -0.238, HZ - 0.02), (0.02, 0.022, 0.05), SKIN, head, 16, 10)
sphere("NoseTip", (0, -0.262, HZ - 0.062), (0.032, 0.027, 0.026), SKIN, head, 20, 12)
for s in (-1, 1):
    sphere("Nostril", (s * 0.017, -0.276, HZ - 0.07), (0.008, 0.005, 0.005), SKIN_D, head, 8, 6)
    sphere("Cheek", (s * 0.115, -0.190, HZ - 0.080), (0.05, 0.034, 0.042), SKIN, head, 20, 12)
# smirk
tube("Mouth", [(-0.058, -0.246, HZ - 0.135), (-0.02, -0.254, HZ - 0.145), (0.03, -0.254, HZ - 0.143), (0.078, -0.240, HZ - 0.116)], 0.0065, LIPM, head)
sphere("LipLow", (0.005, -0.247, HZ - 0.158), (0.034, 0.012, 0.011), SKIN_D, head, 14, 8)
# trimmed mustache + soul patch + jawline beard (cheeks stay clean)
tube("Mustache", [(-0.092, -0.236, HZ - 0.100), (-0.045, -0.262, HZ - 0.110), (0.0, -0.264, HZ - 0.104), (0.045, -0.262, HZ - 0.110), (0.092, -0.236, HZ - 0.100)], 0.0095, HAIR, head)
sphere("Soul", (0, -0.238, HZ - 0.185), (0.022, 0.012, 0.026), HAIR, head, 14, 8)
for s in (-1, 1):
    tube("JawBeard", [(s * 0.215, -0.055, HZ - 0.045), (s * 0.190, -0.115, HZ - 0.120), (s * 0.140, -0.178, HZ - 0.200), (s * 0.075, -0.212, HZ - 0.238), (s * 0.0, -0.222, HZ - 0.248)], 0.017, HAIR, head)
sphere("ChinPad", (0, -0.205, HZ - 0.236), (0.08, 0.045, 0.03), HAIR, head, 24, 12)

# ---------------- HAIR: dense, tidy curls ----------------
sphere("HairCap", (0, 0.065, HZ + 0.075), (0.282, 0.255, 0.222), HAIR, head, 40, 20)
def curl(th, ph, r, push=1.0, stretch=1.0):
    cx, cy, cz = 0, 0.012, HZ + 0.03
    x = cx + 0.292 * push * math.sin(ph) * math.sin(th); y = cy - 0.272 * push * math.sin(ph) * math.cos(th); z = cz + 0.292 * push * math.cos(ph)
    s = r * random.uniform(0.85, 1.2)
    o = sphere("Curl", (x, y, z), (s, s * random.uniform(0.85, 1.1), s * stretch), HAIR, head, 12, 8)
    o.rotation_euler = (random.random() * 3, random.random() * 3, random.random() * 3)
rows = [(6, 7, .05), (18, 12, .047), (31, 18, .045), (44, 24, .044), (57, 30, .043), (70, 34, .042), (84, 34, .042), (98, 28, .042), (110, 20, .042)]
for pd, n, r in rows:
    for i in range(n):
        th = (i / n) * 2 * math.pi + random.uniform(-0.1, 0.1)
        front = abs(((th + math.pi) % (2 * math.pi)) - math.pi) < 1.0
        if front and pd > 66: continue
        if abs(abs(math.sin(th)) - 1) < 0.2 and pd > 78: continue   # keep ears visible
        curl(th, math.radians(pd + random.uniform(-4, 4)), r, random.uniform(0.99, 1.08))
for i in range(9):                                   # curly fringe over the forehead
    curl(-0.75 + i * 0.19 + random.uniform(-.03, .03), math.radians(random.uniform(52, 62)), 0.036, 1.03, 1.1)
for th, ph in [(-1.15, 66), (1.15, 66), (-1.3, 78), (1.3, 78)]:
    curl(th, math.radians(ph), 0.034, 1.0)

# ---------------- BODY ----------------
sphere("Torso", (0, 0, 0.36 + 0.215), (0.198, 0.145, 0.135), SHIRT, body, 40, 24)
sphere("Waist", (0, 0, 0.36 + 0.085), (0.15, 0.116, 0.13), SHIRT, body, 36, 20)
bpy.ops.mesh.primitive_torus_add(major_radius=0.074, minor_radius=0.014, location=(0, -0.004, 0.36 + 0.332)); c = bpy.context.object; c.name = "Collar"; fin(par(c, body), BLACK)
sphere("Neck", (0, 0, 0.36 + 0.352), (0.082, 0.07, 0.075), SKIN, body, 20, 12)
sphere("Hips", (0, 0, 0.36 - 0.01), (0.15, 0.125, 0.11), PANTS, body, 32, 16)
sphere("TeeHem", (0, 0, 0.36 + 0.03), (0.162, 0.125, 0.04), SHIRT, body, 32, 12)

def arm(side):
    s = 1 if side == "R" else -1
    sh = empty("Arm" + side, (s * 0.228, 0, 0.36 + 0.285), body)
    sphere("Shoulder", (s * 0.232, 0, 0.36 + 0.278), (0.086, 0.082, 0.082), SHIRT, sh, 20, 12)
    cyl("Sleeve", (s * 0.255, 0, 0.36 + 0.228), 0.07, 0.12, SHIRT, sh, rot=(0, s * 0.2, 0), r2=0.082)
    sphere("Bicep", (s * 0.265, -0.01, 0.36 + 0.215), (0.06, 0.06, 0.075), SHIRT, sh, 20, 12)
    sphere("Cuff", (s * 0.275, 0, 0.36 + 0.17), (0.066, 0.074, 0.018), BLACK, sh, 18, 8)
    cyl("Forearm", (s * 0.285, 0, 0.36 + 0.095), 0.045, 0.16, SKIN, sh, rot=(0, s * 0.12, 0), r2=0.04)
    sphere("Hand", (s * 0.295, 0, 0.36 + 0.0), (0.055, 0.046, 0.06), SKIN, sh, 20, 12)
    if side == "L":
        bpy.ops.mesh.primitive_torus_add(major_radius=0.04, minor_radius=0.011, location=(s * 0.29, 0, 0.36 + 0.05)); w = bpy.context.object; w.name = "Watch"; fin(par(w, sh), BLACK)
        sphere("WatchFace", (s * 0.29, -0.036, 0.36 + 0.05), (0.034, 0.011, 0.034), BLACK, sh, 16, 8)
arm("R"); arm("L")

def leg(side):
    s = 1 if side == "R" else -1
    lg = empty("Leg" + side, (s * 0.082, 0, 0.36 - 0.02), body)
    cyl("Pant", (s * 0.086, 0, 0.36 - 0.115), 0.078, 0.23, PANTS, lg, r2=0.084)
    cyl("Cuff", (s * 0.086, 0, 0.36 - 0.222), 0.07, 0.04, PANTS, lg, r2=0.078)
    box("Cargo", (s * 0.158, -0.01, 0.36 - 0.10), (0.02, 0.05, 0.055), PANTS, lg, bevel=0.01)
    sphere("Shoe", (s * 0.088, -0.045, 0.082), (0.082, 0.15, 0.062), CREAM, lg, 24, 14)
    sphere("ShoeToe", (s * 0.088, -0.118, 0.07), (0.074, 0.075, 0.05), WHITEL, lg, 20, 12)
    sphere("Collar2", (s * 0.088, 0.03, 0.12), (0.07, 0.05, 0.04), BLACK, lg, 16, 8)
    sphere("Swoosh", (s * (0.088 + 0.07 * 0.9), -0.05, 0.095), (0.008, 0.07, 0.022), BLACK, lg, 12, 6)
    sphere("Sole", (s * 0.088, -0.04, 0.03), (0.09, 0.165, 0.03), WHITEL, lg, 24, 10)
leg("R"); leg("L")

mode = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "render"
if mode == "export":
    out = os.path.join(HERE, "..", "public", "models", "mini-ashique.glb")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_cameras=False, export_lights=False, export_yup=True)
    print("EXPORTED", out)
else:
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_EEVEE'
    sc.view_settings.view_transform = 'Standard'; sc.render.resolution_x = 900; sc.render.resolution_y = 900
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.05, 0.05, 0.07, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 1.0
    for nm, loc, e, col in [("k", (-1.6, -2.4, 2.0), 210, (1, .92, .82)), ("f", (2, -1.6, 1.0), 80, (.6, .75, 1)), ("r", (0, 2, 2.4), 260, (1, .55, .25))]:
        L = bpy.data.lights.new(nm, 'AREA'); L.energy = e; L.color = col; L.size = 1.5
        lo = bpy.data.objects.new(nm, L); lo.location = loc; sc.collection.objects.link(lo)
        lo.rotation_euler = (Vector((0, 0, 0.8)) - lo.location).to_track_quat('-Z', 'Y').to_euler()
    cam = bpy.data.cameras.new("c"); cam.lens = 70; co = bpy.data.objects.new("c", cam); sc.collection.objects.link(co); sc.camera = co
    shots = {"face": ((0, -1.6, 1.12), (0, 0, 1.06)), "full": ((0, -3.4, 0.7), (0, 0, 0.62)), "three_q": ((-1.0, -1.5, 1.2), (0, 0, 1.05))}
    for k, (cl, tg) in shots.items():
        co.location = cl; co.rotation_euler = (Vector(tg) - Vector(cl)).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(HERE, f"prev_{k}.png"); bpy.ops.render.render(write_still=True)
