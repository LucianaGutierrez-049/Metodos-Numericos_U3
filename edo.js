'use strict';
const odeExamples={guide:['(x^2-y^2)/(x*y)','1','2','1.2','0.1','sqrt(x^2/2+7/(2*x^2))'],linear:['x+y','0','1','1','0.2','2*exp(x)-x-1'],product:['2*x*y','1','1','1.5','0.1','exp(x^2-1)'],decay:['-2*y','0','1','1','0.1','exp(-2*x)']};
function odeFinite(v,context){if(!Number.isFinite(v))throw Error('Valor no finito en '+context+'. Revisa el dominio, las divisiones y el paso.');return v;}
function solveIVP(f,x0,y0,target,h,method){
 if(![x0,y0,target,h].every(Number.isFinite)||h<=0)throw Error('Los datos deben ser finitos y h debe ser positivo.');
 const distance=Math.abs(target-x0),ratio=distance/h,N=Math.round(ratio);
 if(distance===0||!Number.isFinite(ratio)||N<1||N>1000)throw Error('Elige un punto final diferente y entre 1 y 1000 pasos.');
 if(Math.abs(ratio-N)>1e-8*Math.max(1,ratio))throw Error('h no divide exactamente la distancia hasta x final. Cambia h para llegar con pasos iguales.');
 if(!['euler','heun'].includes(method))throw Error('Método no válido.');
 const step=Math.sign(target-x0)*h,rows=[{i:0,x:x0,y:y0}],steps=[];let y=y0;
 for(let i=0;i<N;i++){
  const x=x0+i*step,next=i===N-1?target:x0+(i+1)*step;
  const k1=odeFinite(f(x,y),`f(${fmt(x)},${fmt(y)})`),pred=odeFinite(y+step*k1,'predictor');
  const k2=method==='heun'?odeFinite(f(next,pred),`f(${fmt(next)},${fmt(pred)})`):null;
  const yn=odeFinite(method==='heun'?y+step*(k1+k2)/2:pred,'nuevo valor');
  steps.push({i,x,y,next,k1,pred,k2,yn,step});rows.push({i:i+1,x:next,y:yn});y=yn;
 }
 return {method,rows,steps,value:y,N,step};
}
function odeTable(headers,rows){return `<div class="convergence-card table-scroll"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
let odeCurrent=null;
function odeInvalidate(message){odeCurrent=null;document.getElementById('ode-message').textContent=message;document.querySelectorAll('#ode-stats,#ode-tables,#ode-steps,#ode-summary,#ode-comparison,#ode-chart').forEach(e=>e.classList.add('stale'));}
function odeRun(){
 const get=id=>document.getElementById(id).value.trim(),expression=get('ode-f'),f=parseExpression(expression,'ode');
 const x0=constant(get('ode-x0')),y0=constant(get('ode-y0')),target=constant(get('ode-target')),h=constant(get('ode-h')),mode=get('ode-method');
 const exactText=get('ode-exact'),exact=exactText?parseExpression(exactText):null;
 if(!['both','euler','heun'].includes(mode))throw Error('Selecciona un método válido.');
 const methods=mode==='both'?['euler','heun']:[mode],solutions=methods.map(method=>solveIVP(f,x0,y0,target,h,method));
 if(exact){const initial=odeFinite(exact(x0),'solución exacta inicial');if(Math.abs(initial-y0)>1e-7*Math.max(1,Math.abs(y0)))throw Error('La solución exacta ingresada no cumple y(x inicial) = y inicial. Corrige ese dato o deja el campo vacío.');}
 const actual=exact?odeFinite(exact(target),'solución exacta final'):null;
 for(const sol of solutions){sol.error=actual===null?null:Math.abs(actual-sol.value);sol.relative=actual===null||actual===0?null:sol.error/Math.abs(actual);sol.percent=sol.relative===null?null:100*sol.relative;if(exact)for(const row of sol.rows)row.exact=odeFinite(exact(row.x),'solución exacta en la malla');}
 // Construir toda la salida antes de marcarla como vigente.
 const titles={euler:'Euler',heun:'Euler mejorado (Heun)'};
 let tables='',steps='';
 for(const sol of solutions){
  const rows=sol.steps.map(r=>sol.method==='heun'?[r.i,exam(r.x),exam(r.y),exam(r.k1),exam(r.pred),exam(r.k2),exam(r.yn)]:[r.i,exam(r.x),exam(r.y),exam(r.k1),exam(r.yn)]);
  tables+=`<article class="ode-table-block"><h3>${titles[sol.method]} · tabla de iteraciones</h3>${odeTable(sol.method==='heun'?['i','xᵢ','yᵢ','k₁','Predictor z','k₂','yᵢ₊₁']:['i','xᵢ','yᵢ','f(xᵢ,yᵢ)','yᵢ₊₁'],rows)}</article>`;
  steps+=`<article class="paper ode-work"><h3>${titles[sol.method]} · desarrollo manual</h3><div class="math-box exam-equation">${sol.method==='euler'?'y<sub>i+1</sub> = y<sub>i</sub> + h f(x<sub>i</sub>,y<sub>i</sub>)':`k₁ = f(xᵢ,yᵢ)<br>z = yᵢ + h k₁<br>k₂ = f(xᵢ + h,z)<br>yᵢ₊₁ = yᵢ + ${fraction('h','2')}(k₁ + k₂)`}</div>`;
  for(const r of sol.steps){steps+=`<details class="ode-step" ${sol.N<=8?'open':''}><summary>Paso ${r.i+1} · x = ${exam(r.x)} → ${exam(r.next)}</summary><p>Se parte de y<sub>${r.i}</sub> = ${exam(r.y)}.</p><div class="exam-equation">${sol.method==='euler'?'Pendiente':'k₁'} = f(${exam(r.x)}, ${exam(r.y)})<br>= ${exam(r.k1)}</div>${sol.method==='heun'?`<div class="exam-equation">z = ${exam(r.y)} + (${exam(r.step)}) × (${exam(r.k1)})<br>z ≈ <b>${exam(r.pred)}</b></div><div class="exam-equation">k₂ = f(${exam(r.next)}, ${exam(r.pred)})<br>≈ ${exam(r.k2)}</div><div class="exam-equation">y<sub>${r.i+1}</sub> ≈ ${exam(r.y)} + ${fraction(exam(r.step),'2')} × [(${exam(r.k1)}) + (${exam(r.k2)})]</div>`:`<div class="exam-equation">y<sub>${r.i+1}</sub> = ${exam(r.y)} + (${exam(r.step)}) × (${exam(r.k1)})</div>`}<div class="exam-equation">y<sub>${r.i+1}</sub> ≈ <b>${exam(r.yn)}</b></div></details>`;}
  steps+=`<div class="answer"><span>${titles[sol.method]} EN x = ${exam(target)}</span><strong>y(${exam(target)}) ≈ ${exam(sol.value)}</strong></div>`;
  if(actual!==null)steps+=`<h4>Error respecto al valor exacto ingresado</h4><div class="exam-equation">Eₐ = | ${exam(actual)} − (${exam(sol.value)}) |<br>≈ ${exam(sol.error)}</div><div class="exam-equation">${actual===0?'Error relativo y porcentual no definidos: el valor exacto es cero.':`eᵣ = ${fraction(exam(sol.error),exam(Math.abs(actual)))} ≈ ${exam(sol.relative)}<br>e% = eᵣ × 100 ≈ ${exam(sol.percent)} %`}</div>`;else steps+='<p class="muted">No se ingresó una solución exacta; no se calcula el error real.</p>';
  steps+='</article>';
 }
 const state={expression,x0,y0,target,h,exact,exactText,actual,solutions};odeDraw(state);
 document.getElementById('ode-description').textContent=`y′ = ${expression}; y(${fmt(x0)}) = ${fmt(y0)}; h = ${fmt(h)}`;
 const stats=solutions.map(s=>`<article><span>${titles[s.method].toUpperCase()}</span><strong>${exam(s.value)}</strong><small>y(${exam(target)}) aproximado</small></article>`).join('');
 document.getElementById('ode-stats').innerHTML=stats+`<article><span>VALOR EXACTO INGRESADO</span><strong>${actual===null?'Sin dato':exam(actual)}</strong><small>Referencia opcional</small></article><article><span>MALLA DE CÁLCULO</span><strong>${solutions[0].N} pasos</strong><small>${solutions[0].N+1} puntos · paso firmado ${exam(solutions[0].step)}</small></article>`;
 document.getElementById('ode-summary').innerHTML=`<p class="section-intro">y′ = ${escapeHTML(expression)} · y(${exam(x0)}) = ${exam(y0)} · objetivo y(${exam(target)}).</p><div class="math-box">N = |${exam(target)} − (${exam(x0)})| / ${exam(h)} = ${solutions[0].N} pasos.</div><p class="muted">Se muestran seis decimales y se conserva precisión completa durante el cálculo. Al operar con números ya redondeados puede variar el último decimal. Heun usa una predicción y una corrección por paso.</p>`;
 document.getElementById('ode-tables').innerHTML=tables;document.getElementById('ode-steps').innerHTML=steps;
 document.getElementById('ode-comparison').innerHTML=odeTable(['Método','y final','Error absoluto','Error relativo','Error (%)'],solutions.map(s=>[titles[s.method],exam(s.value),exam(s.error),exam(s.relative),s.percent===null?'—':exam(s.percent)+' %']));
 odeCurrent=state;document.querySelectorAll('#ode-stats,#ode-tables,#ode-steps,#ode-summary,#ode-comparison,#ode-chart').forEach(e=>e.classList.remove('stale'));document.getElementById('ode-message').textContent='Ejercicio resuelto. Revisa las iteraciones y el desarrollo.';return state;
}
function odeDraw(s){
 const {x0,target,solutions,exact}=s,W=800,H=360,L=68,R=24,T=26,B=48;let groups=solutions.map(v=>({points:v.rows.map(r=>[r.x,r.y]),color:v.method==='euler'?'#d17643':'#246b83'}));
 if(exact)groups.push({points:Array.from({length:301},(_,i)=>{const x=x0+(target-x0)*i/300;return[x,odeFinite(exact(x),'gráfica de la solución exacta')];}),color:'#676c73',dash:true});
 const values=groups.flatMap(g=>g.points.map(p=>p[1]));const low=Math.min(...values),high=Math.max(...values),pad=(high-low||Math.max(1,Math.abs(high)))*.15,min=low-pad,max=high+pad;
 const px=x=>L+(x-x0)/(target-x0)*(W-L-R),py=y=>H-B-(y-min)/(max-min)*(H-T-B);let svg='';
 for(let i=0;i<=4;i++){const y=min+(max-min)*i/4,x=x0+(target-x0)*i/4;svg+=`<line x1="${L}" y1="${py(y)}" x2="${W-R}" y2="${py(y)}" stroke="#e6e4df"/><text x="${L-8}" y="${py(y)+4}" text-anchor="end">${Number(y.toPrecision(4))}</text><text x="${px(x)}" y="${H-B+24}" text-anchor="middle">${Number(x.toPrecision(5))}</text>`;}
 for(const g of groups){svg+=`<path d="${g.points.map(([x,y],i)=>`${i?'L':'M'}${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="${g.color}" stroke-width="${g.dash?2:3}" ${g.dash?'stroke-dasharray="6 5"':''}/>`;if(!g.dash&&g.points.length<60)for(const [x,y]of g.points)svg+=`<circle cx="${px(x)}" cy="${py(y)}" r="3" fill="${g.color}"/>`;}
 document.getElementById('ode-chart').innerHTML=svg+'<text x="68" y="16">y(x)</text><text x="770" y="350">x</text>';
}
function odeInit(){
 const form=document.getElementById('ode-form');form.addEventListener('input',e=>{if(e.target.id==='ode-example'||e.target.id==='ode-method')return;document.getElementById('ode-example').value='custom';odeInvalidate('Datos modificados. Pulsa Resolver para actualizar.');});form.addEventListener('change',e=>{if(e.target.id==='ode-method')odeInvalidate('Método modificado. Pulsa Resolver para actualizar.');});
 form.addEventListener('submit',e=>{e.preventDefault();try{odeRun();}catch(err){odeInvalidate(err.message);}});
 document.getElementById('ode-example').addEventListener('change',e=>{const values=odeExamples[e.target.value];if(!values){odeInvalidate('Ingresa tu propio ejercicio y pulsa Resolver.');return;}['ode-f','ode-x0','ode-y0','ode-target','ode-h','ode-exact'].forEach((id,i)=>document.getElementById(id).value=values[i]);try{odeRun();}catch(err){odeInvalidate(err.message);}});
 document.getElementById('ode-print').addEventListener('click',()=>{if(!odeCurrent){document.getElementById('ode-message').textContent='Resuelve los datos actuales antes de imprimir.';form.scrollIntoView();return;}window.print();});
 document.getElementById('ode-csv').addEventListener('click',()=>{if(!odeCurrent){document.getElementById('ode-message').textContent='Resuelve los datos actuales antes de exportar.';form.scrollIntoView();return;}const s=odeCurrent,quote=v=>'"'+String(v).replace(/"/g,'""')+'"';let csv='\uFEFFFuncion,'+quote(s.expression)+'\r\nx0,'+s.x0+'\r\ny0,'+s.y0+'\r\nx final,'+s.target+'\r\nh,'+s.h+'\r\nMetodo,i,x,y,k1,predictor,k2,valor exacto,error absoluto,error relativo,error porcentual\r\n';for(const sol of s.solutions)for(const row of sol.rows){const step=sol.steps[row.i-1],e=row.exact===undefined?null:Math.abs(row.exact-row.y),r=row.exact===undefined||row.exact===0?null:e/Math.abs(row.exact);csv+=[sol.method,row.i,row.x,row.y,step?.k1??'',step?.pred??'',step?.k2??'',row.exact??'',e??'',r??'',r===null?'':r*100].join(',')+'\r\n';}const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})),a=document.createElement('a');a.href=url;a.download='ejercicio_euler_heun.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 try{odeRun();}catch(err){odeInvalidate(err.message);}
}
if(typeof document!=='undefined'&&document.getElementById('ode-form'))odeInit();
