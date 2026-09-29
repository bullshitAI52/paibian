const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s=fs.readFileSync(process.argv[2]||require('path').join(__dirname,'../index.html'),'utf8');
const f=s.slice(s.indexOf('const generateOneSchedule ='),s.indexOf('const generatedPlans ='));
for(const mode of ['2plus2','random','2plus2first']) {
 let successes=0;
 for(let trial=0;trial<8;trial++){
  const ctx={employees:{value:Array.from({length:10},(_,i)=>({id:i,schedule:{}}))},daysInMonth:{value:31},totalWorkTarget:{value:270},fixedMonthlyRestDays:4,priorityEnabled:{value:trial%2===0},priorityDays:{value:5},scheduleMode:{value:mode},mode3Days:{value:0},mode3DayCount:{value:5},mode3NightCount:{value:4},specialDayRules:{value:[1,2,3,4].map(d=>({enabled:true,day:d,dayCount:5,nightCount:d<=2?5:4,priority:true}))},alert:()=>{}};
  vm.createContext(ctx);vm.runInContext(f+'this.run=generateOneSchedule;',ctx);
  const ok=ctx.run(true);if(!ok)continue;successes++;
  for(let d=1;d<=31;d++){
   const counts=[0,0];ctx.employees.value.forEach((e,i)=>{if(e.schedule[d]!=='休'&&e.schedule[d]!=='离')counts[i<5?0:1]++});
   if(d<=4)assert.deepEqual(counts,[5,d<=2?5:4]);else assert(counts[0]+counts[1]>=8&&counts[0]+counts[1]<=9);
  }
  ctx.employees.value.forEach(e=>{const rests=Object.keys(e.schedule).filter(d=>e.schedule[d]==='休').map(Number);assert.equal(rests.length,4);if(mode==='2plus2'){assert.equal(rests[1],rests[0]+1);assert.equal(rests[3],rests[2]+1)}});
 }
 assert(successes>0,'no successful '+mode);console.log(mode,successes+'/8 valid schedules');
}
{
const original=Array.from({length:10},(_,i)=>({id:i,schedule:{1:i===0?'休':'A'}}));
const ctx={employees:{value:JSON.parse(JSON.stringify(original))},daysInMonth:{value:31},totalWorkTarget:{value:270},fixedMonthlyRestDays:4,priorityEnabled:{value:false},priorityDays:{value:5},scheduleMode:{value:'2plus2'},mode3Days:{value:0},mode3DayCount:{value:5},mode3NightCount:{value:4},specialDayRules:{value:[{enabled:true,day:1,dayCount:5,nightCount:5,priority:true}]},alert:()=>{}};
vm.createContext(ctx);vm.runInContext(f+'this.run=generateOneSchedule;',ctx);assert.equal(ctx.run(true),false);assert.equal(JSON.stringify(ctx.employees.value),JSON.stringify(original));console.log('Conflicting manual rest rejected without changing original schedule');
}
