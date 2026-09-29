const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');const f=s.slice(s.indexOf('const generateOneSchedule ='),s.indexOf('const generatedPlans ='));
const dates=[[],[5],[9,10,22,23],[6,7],[13,14,15],[11,12,25,26],[5,6,19,20],[3,4],[9,10,21,22],[7,8,23,24]];
for(let trial=0;trial<5;trial++){
 const ctx={employees:{value:dates.map((ds,i)=>({id:i,name:'人员'+(i+1),schedule:Object.fromEntries(ds.map(d=>[d,'休']))}))},daysInMonth:{value:31},totalWorkTarget:{value:270},fixedMonthlyRestDays:4,priorityEnabled:{value:false},priorityDays:{value:5},scheduleMode:{value:'2plus2'},mode3Days:{value:0},mode3DayCount:{value:5},mode3NightCount:{value:4},specialDayRules:{value:[1,2,3,4].map(d=>({enabled:true,day:d,dayCount:5,nightCount:d<=2?5:4,priority:true}))},alert:console.log};
 vm.createContext(ctx);vm.runInContext(f+'this.run=generateOneSchedule;',ctx);assert(ctx.run(false));
 ctx.employees.value.forEach((e,i)=>{dates[i].forEach(d=>assert.equal(e.schedule[d],'休'));assert.equal(Object.values(e.schedule).filter(v=>v==='休').length,4)});
 for(let d=1;d<=31;d++){
 const counts=[0,0];ctx.employees.value.forEach((e,i)=>{if(e.schedule[d]!=='休')counts[i<5?0:1]++});
 if(d<=4)assert.deepEqual(counts,[5,d<=2?5:4]);else{assert(counts.every(v=>v>=4));assert(counts[0]+counts[1]<=9)}
 }
}
console.log('Screenshot fixed-rest fixture: 5/5 solved; all locked days, 4 rests/person, holiday groups and daily staffing verified');
