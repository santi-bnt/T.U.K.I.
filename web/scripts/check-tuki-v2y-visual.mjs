import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = process.argv[2] ? resolve(process.argv[2]) : new URL('../public/models/tuki-v2y-visual.glb', import.meta.url);
const b = readFileSync(path);
assert.equal(b.toString('utf8',0,4), 'glTF');
assert.equal(b.readUInt32LE(4), 2);
assert.equal(b.readUInt32LE(8), b.byteLength);
let offset=12, doc, binary;
while(offset < b.length) {
  const size=b.readUInt32LE(offset), type=b.toString('ascii',offset+4,offset+8);
  offset+=8;
  if(type==='JSON')doc=JSON.parse(b.subarray(offset,offset+size).toString('utf8').trim());
  if(type.startsWith('BIN'))binary=b.subarray(offset,offset+size);
  offset+=size;
}
assert.ok(doc && binary);
assert.ok(doc.buffers.every(buffer => !buffer.uri));
assert.equal(doc.animations.length,5);
assert.equal(doc.scenes.length,1);
assert.equal(doc.scene,0);
const nodeByName=new Map(doc.nodes.map((node,i)=>[node.name,i]));
const root=nodeByName.get('TUKI_V2Y_MM');
assert.ok(Number.isInteger(root));
assert.ok(Math.abs(doc.nodes[root].matrix[0]-0.001)<1e-8);
const structural=['MANO','FOREARM_V2Y','ACTUACION_V2Y','SERVOS_NOMINALES_V2Y',
  'ForearmShell_V2Y','ForearmDoor_V2Y','WristCollar_V2Y','ElectronicsCabinet_V2Y',
  'ElectronicsDoor_V2Y','TransitionCover_V2Y','ServoBoard_5SG90_V2Y','TendonGuideUpper_V2Y','TendonGuideMid_V2Y'];
for(const name of structural)assert.ok(nodeByName.has(name),`Missing ${name}`);
for(const finger of ['PULGAR','INDICE','MEDIO','ANULAR','MENIQUE']){
  for(const suffix of ['FACE_VISUAL','LABEL_VISUAL'])
    assert.ok(nodeByName.has(`SG90_${finger}_${suffix}`), `Missing visual servo ${finger} ${suffix}`);
  assert.ok(nodeByName.has(`POLEA_${finger}_HUB_VISUAL`), `Missing visual pulley hub ${finger}`);
}
for(const banned of ['CARCASA_ANTEBRAZO','TAPA_ANTEBRAZO','MARCO_CAJON','CAJON_USB_C','RACK_DIAGONAL_5_SG90'])
  assert.ok(!nodeByName.has(banned),`Obsolete geometry remains: ${banned}`);
const reachable=new Set();
function visit(i){if(reachable.has(i))return;reachable.add(i);for(const child of doc.nodes[i].children||[])visit(child);}
for(const i of doc.scenes[0].nodes)visit(i);
assert.equal(reachable.size,doc.nodes.length,'Unreachable legacy nodes found');
function readVec4(accessorId,index){
  const a=doc.accessors[accessorId],v=doc.bufferViews[a.bufferView];
  assert.equal(a.type,'VEC4');assert.equal(a.componentType,5126);
  const start=(v.byteOffset||0)+(a.byteOffset||0)+index*16;
  return [0,1,2,3].map(i=>binary.readFloatLE(start+4*i));
}
for(const [finger,count] of Object.entries({PULGAR:2,INDICE:3,MEDIO:3,ANULAR:3,MENIQUE:3})){
  const clip=doc.animations.find(a=>a.name===`CLOSE_${finger}`);
  assert.ok(clip,`Missing clip for ${finger}`);
  assert.equal(clip.channels.length,count);
  let moved=0;
  clip.channels.forEach(channel=>{
    const name=doc.nodes[channel.target.node]?.name;
    assert.ok(new RegExp(`^FINGER_${finger}_`).test(name),`Wrong finger in ${clip.name}: ${name}`);
    assert.ok(reachable.has(channel.target.node));
    const sample=clip.samplers[channel.sampler];
    const output=doc.accessors[sample.output];
    assert.ok(output.count>=2);
    const first=readVec4(sample.output,0),last=readVec4(sample.output,output.count-1);
    const delta=first.map((x,j)=>Math.abs(x-last[j])).reduce((a,b)=>a+b,0);
    if(delta>0.01)moved++;
  });
  assert.ok(moved>0,`${clip.name} does not change orientation`);
}
for(const {name} of doc.nodes.filter(node=>node.name?.startsWith('SG90_') && node.name?.endsWith('_V2Y'))){
  assert.ok(name.includes('PROXY'),'Nominal SG90 visual geometry must be labeled as proxy');
}
console.log('TUKI V2Y visual: GLB valid; original articulated hand, five clips, V2Y shell, doors, board, guides and nominal servo proxies verified.');
