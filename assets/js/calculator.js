function calculate(){
  // 1. init & validate
  const type = input.get('type').raw();
  let pa=null, pb=null, paNot=null, pbNot=null, paAndPb=null, 
    paOrPb=null, paXorPb=null, paNorPb=null, paNotPb=null, pbNotPa=null,
    result, confidenceIntervals;
  const events = {
    "A: P(A)": 'pa',
    "B: P(B)": 'pb',
    "A NOT occuring: P(A')": 'paNot',
    "B NOT occuring: P(B')": 'pbNot',
    "A and B both occuring: P(A∩B)": 'paAndPb',
    "A or B or both occur: P(A∪B)": 'paOrPb',
    "A or B occurs but NOT both: P(AΔB)": 'paXorPb',
    "Neither A nor B occuring: P((A∪B)')": 'paNorPb',
  }
  
  // 2. calculate
  const calcProbabilities = () => {
    paNot = calc('1-pa',{pa,pb});
    pbNot = calc('1-pb',{pa,pb});
    paAndPb = calc('pa*pb',{pa,pb});
    paOrPb = calc('pa+pb-pa*pb',{pa,pb});
    paXorPb = calc('pa+pb-2*pa*pb',{pa,pb});
    paNorPb = calc('1-pa-pb+pa*pb',{pa,pb});
    paNotPb = calc('pa*(1-pb)',{pa,pb});
    pbNotPa = calc('(1-pa)*pb',{pa,pb});
  };
  switch(type){
    case 'Probability of Two Events': 
      pa = input.get('probability_a').probability().val();
      pb = input.get('probability_b').probability().val();
      if(!input.valid()) return;

      calcProbabilities();
      result = {paNot, pbNot, paAndPb, paOrPb, paXorPb, paNorPb, paNotPb, pbNotPa};
    break;

    case 'Probability Solver for Two Events': 
      const eventA = events[input.get('probability_of_dropdown_a').raw()];
      const eventB = events[input.get('probability_of_dropdown_b').raw()];
      const pEventA = input.get('probability_of_a').probability().val();
      const pEventB = input.get('probability_of_b').probability().val();
      const fields = ['probability_of_dropdown_a','probability_of_dropdown_b']; 
      const eventAB = [eventA,eventB];
      if(eventA == eventB){
        input.error(fields, "Please provide 2 different events");
      }
      if(eventAB.includes('pa') && eventAB.includes('paNot')){
        input.error(fields, "Please provide 2 values other than P(A) and P(A')");
      }
      if(eventAB.includes('pb') && eventAB.includes('pbNot')){
        input.error(fields, "Please provide 2 values other than P(B) and P(B')");
      }
      if(eventAB.includes('paOrPb') && eventAB.includes('paNorPb')){
        input.error(fields, "Please provide 2 values other than P(A∪B) and P((A∪B)')");
      }
      if(eventAB.includes('pa') && eventAB.includes('paXorPb')){
        input.error(fields, "Unable to find P(B) and the rest probabilities.");
      }
      if(eventAB.includes('pb') && eventAB.includes('paXorPb')){
        input.error(fields, "Unable to find P(A) and the rest probabilities.");
      }
      if(eventAB.includes('paNot') && eventAB.includes('paXorPb')){
        input.error(fields, "Unable to find P(B) and the rest probabilities.");
      }
      if(eventAB.includes('pbNot') && eventAB.includes('paXorPb')){
        input.error(fields, "Unable to find P(A) and the rest probabilities.");
      }
      if(!input.valid()) return;

      const getPEvent = (eventX, pEventX) => {
        switch(eventX){
          case 'pa': pa = pEventX; break;
          case 'pb': pb = pEventX; break;
          case 'paNot': paNot = pEventX; break;
          case 'pbNot': pbNot = pEventX; break;
          case 'paAndPb': paAndPb = pEventX; break;
          case 'paOrPb': paOrPb = pEventX; break;
          case 'paXorPb': paXorPb = pEventX; break;
          case 'paNorPb': paNorPb = pEventX; break;
        }
      };
      getPEvent(eventA, pEventA);
      getPEvent(eventB, pEventB);

      try{
        // solve
        if(paNot != null){
          pa = calc(`1-paNot`,{paNot});
        }
        if(pbNot != null){
          pb = calc(`1-pbNot`,{pbNot});
        }

        // pa
        if(pa != null){
          if(paAndPb != null){
            pb = calc(`paAndPb/pa`,{paAndPb,pa});
          }
          else if(paOrPb != null){
            pb = calc(`(paOrPb-pa)/(1-pa)`,{paOrPb,pa});
          }
          else if(paXorPb != null){
            pb = calc(`(paXorPb-pa)/(1-2*pa)`,{paXorPb,pa});
          }
          else if(paNorPb != null){
            pb = calc(`(1-paNorPb-pa)/(1-pa)`,{paNorPb,pa});
          }
        }
        // pb
        else if(pb != null){          
          if(pb != null && paAndPb != null){
            pa = calc(`paAndPb/pb`,{paAndPb,pb});
          }
          else if(pb != null && paOrPb != null){
            pa = calc(`(paOrPb-pb)/(1-pb)`,{paOrPb,pb});
          }
          else if(pb != null && paXorPb != null){
            pa = calc(`(paXorPb-pb)/(1-2*pb)`,{paXorPb,pb});
          }
          else if(pb != null && paNorPb != null){
            pa = calc(`(1-paNorPb-pb)/(1-pb)`,{paNorPb,pb});
          }
        }
        // other
        else if(pa == null && pb == null){
          let q /* pa*pb */, p /* pa+pb */;
          if(paAndPb != null && paOrPb != null){
            q = calc(`paAndPb`,{paAndPb});
            p = calc(`paAndPb+paOrPb`,{paAndPb,paOrPb});
          }
          else if(paAndPb != null && paXorPb != null){
            q = calc(`paAndPb`,{paAndPb});
            p = calc(`2*paAndPb+paXorPb`,{paAndPb,paXorPb});
          }
          else if(paAndPb != null && paNorPb != null){
            q = calc(`paAndPb`,{paAndPb});
            p = calc(`paAndPb-paNorPb+1`,{paAndPb,paNorPb});
          }
          else if(paOrPb != null && paXorPb != null){
            q = calc(`paOrPb-paXorPb`,{paOrPb,paXorPb});
            p = calc(`2*paOrPb-paXorPb`,{paOrPb,paXorPb});
          }
          else if(paXorPb != null && paNorPb != null){
            q = calc(`1-paNorPb-paXorPb`,{paNorPb,paXorPb});
            p = calc(`paXorPb+2*q`,{paXorPb,q});
          }
          pa = calc(`(p-sqrt(p^2-4*q))/2`,{p,q});
          pb = calc(`(p+sqrt(p^2-4*q))/2`,{p,q});
        }

        calcProbabilities();
        result = [
          `Probability of A: P(A) = ${format(pa)}`,
          `Probability of B: P(B) = ${format(pb)}`,
          `Probability of A NOT occuring: P(A') = 1 - P(A) = ${format(paNot)}`,
          `Probability of B NOT occuring: P(B') = 1 - P(B) = ${format(pbNot)}`,
          `Probability of A and B both occuring: P(A∩B) = P(A) × P(B) = ${format(paAndPb)}`,
          `Probability that A or B or both occur: P(A∪B) = P(A) + P(B) - P(A∩B) = ${format(paOrPb)}`,
          `Probability that A or B occurs but NOT both: P(AΔB) = P(A) + P(B) - 2P(A∩B) = ${format(paXorPb)}`,
          `Probability of neither A nor B occuring: P((A∪B)') = 1 - P(A∪B) = ${format(paNorPb)}`, 
          `Probability of A occuring but NOT B: P(A) × (1 - P(B)) = ${format(paNotPb)}`,
          `Probability of B occuring but NOT A: (1 - P(A)) × P(B) = ${format(pbNotPa)}`,
        ].join('<br><br>');
      } catch(e){
        input.exception(fields,e); return;
      }
    break;

    case 'Series of Independent Events': 
      pa = input.get('probability_event_a').probability().val();
      pb = input.get('probability_event_b').probability().val();
      paRepeat = input.get('probability_repeat_a').natural().val();
      pbRepeat = input.get('probability_repeat_b').natural().val();
      if(!input.valid()) return;

      result = [
        `Probability of A occuring ${paRepeat} time(s) = ${pa}<sup>${paRepeat}</sup> = ` + format(calc(`${pa}^${paRepeat}`)),
        `Probability of A NOT occuring = (1-${pa})<sup>${paRepeat}</sup> = ` + format(calc(`(1-${pa})^${paRepeat}`)),
        `Probability of A occuring = 1-(1-${pa})<sup>${paRepeat}</sup> = ` + format(calc(`1-(1-${pa})^${paRepeat}`)),
        `Probability of B occuring ${pbRepeat} time(s) = ${pb}<sup>${pbRepeat}</sup> = ` + format(calc(`${pb}^${pbRepeat}`)),
        `Probability of B NOT occuring = (1-${pb})<sup>${pbRepeat}</sup> = ` + format(calc(`(1-${pb})^${pbRepeat}`)),
        `Probability of B occuring = 1-(1-${pb})<sup>${pbRepeat}</sup> = ` + format(calc(`1-(1-${pb})^${pbRepeat}`)),
        `Probability of A occuring ${paRepeat} time(s) and B occuring ${pbRepeat} time(s) = ${pa}<sup>${paRepeat}</sup> × ${pb}<sup>${pbRepeat}</sup> = ` + format(calc(`${pa}^${paRepeat}*${pb}^${pbRepeat}`)),
        `Probability of neither A nor B occuring = (1-${pa})<sup>${paRepeat}</sup> × (1-${pb})<sup>${pbRepeat}</sup> = ` + format(calc(`(1-${pa})^${paRepeat}*(1-${pb})^${pbRepeat}`)),
        `Probability of both A and B occuring = (1-(1-${pa})<sup>${paRepeat}</sup>) × (1-(1-${pb})<sup>${pbRepeat}</sup>) = ` + format(calc(`(1-(1-${pa})^${paRepeat})*(1-(1-${pb})^${pbRepeat})`)),
        `Probability of A occuring ${paRepeat} times but not B = ${pa}<sup>${paRepeat}</sup> × (1-${pb})<sup>${pbRepeat}</sup> = ` + format(calc(`${pa}^${paRepeat}*(1-${pb})^${pbRepeat}`)),
        `Probability of B occuring ${pbRepeat} times but not A = (1-${pa})<sup>${paRepeat}</sup> × ${pb}<sup>${pbRepeat}</sup> = ` + format(calc(`(1-${pa})^${paRepeat}*${pb}^${pbRepeat}`)),
        `Probability of A occuring but not B = (1-(1-${pa})<sup>${paRepeat}</sup>) × (1-${pb})<sup>${pbRepeat}</sup> = ` + format(calc(`(1-(1-${pa})^${paRepeat})*(1-${pb})^${pbRepeat}`)),
        `Probability of B occuring but not A = (1-${pa})<sup>${paRepeat}</sup> × (1-(1-${pb})<sup>${pbRepeat}</sup>) = ` + format(calc(`(1-${pa})^${paRepeat}*(1-(1-${pb})^${pbRepeat})`))
      ].join('<br><br>');
    break;

    case 'Normal Distribution': 
      const m = input.get('probability_mean').number().val();
      const s = input.get('probability_deviation').positive().val();
      const lb = input.get('probability_lb').number().val();
      const rb = input.get('probability_rb').number().val();
      if(lb > rb) input.error('lb','Please specify the left bound value less than or equal to the right bound value');
      if(!input.valid()) return;

      const z = [
        0      , 0.00399, 0.00798, 0.01197, 0.01595, 0.01994, 0.02392, 0.0279 , 0.03188, 0.03586,
        0.03983, 0.0438 , 0.04776, 0.05172, 0.05567, 0.05962, 0.06356, 0.06749, 0.07142, 0.07535,
        0.07926, 0.08317, 0.08706, 0.09095, 0.09483, 0.09871, 0.10257, 0.10642, 0.11026, 0.11409,
        0.11791, 0.12172, 0.12552, 0.1293 , 0.13307, 0.13683, 0.14058, 0.14431, 0.14803, 0.15173,
        0.15542, 0.1591 , 0.16276, 0.1664 , 0.17003, 0.17364, 0.17724, 0.18082, 0.18439, 0.18793,
        0.19146, 0.19497, 0.19847, 0.20194, 0.2054 , 0.20884, 0.21226, 0.21566, 0.21904, 0.2224 ,
        0.22575, 0.22907, 0.23237, 0.23565, 0.23891, 0.24215, 0.24537, 0.24857, 0.25175, 0.2549 ,
        0.25804, 0.26115, 0.26424, 0.2673 , 0.27035, 0.27337, 0.27637, 0.27935, 0.2823 , 0.28524,
        0.28814, 0.29103, 0.29389, 0.29673, 0.29955, 0.30234, 0.30511, 0.30785, 0.31057, 0.31327,
        0.31594, 0.31859, 0.32121, 0.32381, 0.32639, 0.32894, 0.33147, 0.33398, 0.33646, 0.33891,
        0.34134, 0.34375, 0.34614, 0.34849, 0.35083, 0.35314, 0.35543, 0.35769, 0.35993, 0.36214,
        0.36433, 0.3665 , 0.36864, 0.37076, 0.37286, 0.37493, 0.37698, 0.379  , 0.381  , 0.38298,
        0.38493, 0.38686, 0.38877, 0.39065, 0.39251, 0.39435, 0.39617, 0.39796, 0.39973, 0.40147,
        0.4032 , 0.4049 , 0.40658, 0.40824, 0.40988, 0.41149, 0.41308, 0.41466, 0.41621, 0.41774,
        0.41924, 0.42073, 0.4222 , 0.42364, 0.42507, 0.42647, 0.42785, 0.42922, 0.43056, 0.43189,
        0.43319, 0.43448, 0.43574, 0.43699, 0.43822, 0.43943, 0.44062, 0.44179, 0.44295, 0.44408,
        0.4452 , 0.4463 , 0.44738, 0.44845, 0.4495 , 0.45053, 0.45154, 0.45254, 0.45352, 0.45449,
        0.45543, 0.45637, 0.45728, 0.45818, 0.45907, 0.45994, 0.4608 , 0.46164, 0.46246, 0.46327,
        0.46407, 0.46485, 0.46562, 0.46638, 0.46712, 0.46784, 0.46856, 0.46926, 0.46995, 0.47062,
        0.47128, 0.47193, 0.47257, 0.4732 , 0.47381, 0.47441, 0.475  , 0.47558, 0.47615, 0.4767 ,
        0.47725, 0.47778, 0.47831, 0.47882, 0.47932, 0.47982, 0.4803 , 0.48077, 0.48124, 0.48169,
        0.48214, 0.48257, 0.483  , 0.48341, 0.48382, 0.48422, 0.48461, 0.485  , 0.48537, 0.48574,
        0.4861 , 0.48645, 0.48679, 0.48713, 0.48745, 0.48778, 0.48809, 0.4884 ,  0.4887, 0.48899,
        0.48928, 0.48956, 0.48983, 0.4901 , 0.49036, 0.49061, 0.49086, 0.49111, 0.49134, 0.49158,
        0.4918 , 0.49202, 0.49224, 0.49245, 0.49266, 0.49286, 0.49305, 0.49324, 0.49343, 0.49361,
        0.49379, 0.49396, 0.49413, 0.4943 , 0.49446, 0.49461, 0.49477, 0.49492, 0.49506, 0.4952 ,
        0.49534, 0.49547, 0.4956 , 0.49573, 0.49585, 0.49598, 0.49609, 0.49621, 0.49632, 0.49643,
        0.49653, 0.49664, 0.49674, 0.49683, 0.49693, 0.49702, 0.49711, 0.4972 , 0.49728, 0.49736,
        0.49744, 0.49752, 0.4976 , 0.49767, 0.49774, 0.49781, 0.49788, 0.49795, 0.49801, 0.49807,
        0.49813, 0.49819, 0.49825, 0.49831, 0.49836, 0.49841, 0.49846, 0.49851, 0.49856, 0.49861,
        0.49865, 0.49869, 0.49874, 0.49878, 0.49882, 0.49886, 0.49889, 0.49893, 0.49896, 0.499  ,
        0.49903, 0.49906, 0.4991 , 0.49913, 0.49916, 0.49918, 0.49921, 0.49924, 0.49926, 0.49929,
        0.49931, 0.49934, 0.49936, 0.49938, 0.4994 , 0.49942, 0.49944, 0.49946, 0.49948, 0.4995 ,
        0.49952, 0.49953, 0.49955, 0.49957, 0.49958, 0.4996 , 0.49961, 0.49962, 0.49964, 0.49965,
        0.49966, 0.49968, 0.49969, 0.4997 , 0.49971, 0.49972, 0.49973, 0.49974, 0.49975, 0.49976,
        0.49977, 0.49978, 0.49978, 0.49979, 0.4998 , 0.49981, 0.49981, 0.49982, 0.49983, 0.49983,
        0.49984, 0.49985, 0.49985, 0.49986, 0.49986, 0.49987, 0.49987, 0.49988, 0.49988, 0.49989,
        0.49989, 0.4999 , 0.4999 , 0.4999 , 0.49991, 0.49991, 0.49992, 0.49992, 0.49992, 0.49992,
        0.49993, 0.49993, 0.49993, 0.49994, 0.49994, 0.49994, 0.49994, 0.49995, 0.49995, 0.49995,
        0.49995, 0.49995, 0.49996, 0.49996, 0.49996, 0.49996, 0.49996, 0.49996, 0.49997, 0.49997,
        0.49997, 0.49997, 0.49997, 0.49997, 0.49997, 0.49997, 0.49998, 0.49998, 0.49998, 0.49998
      ];
      const l = calc(`(${lb}-${m})/${s}`); 
      const r = calc(`(${rb}-${m})/${s}`);
      const zl = calc(`round(abs(${l}*100))<${z.length}`) ? z[calc(`round(abs(${l}*100))`)] : 0.5;
      const zr = calc(`round(abs(${r}*100))<${z.length}`) ? z[calc(`round(abs(${r}*100))`)] : 0.5;
      const p = r >=0 && l >=0 || r <= 0 && l <=0 ? calc(`abs(${zr}-${zl})`) : calc(`${zr}+${zl}`);
      const pNot = calc(`1-${p}`);
      const pLessLb = calc(`0.5 + ${l<=0?-zl:zl}`);
      const pMoreRb = calc(`0.5 + ${r>=0?-zr:zr}`);
      result = [
        `The probability between ${lb} and ${rb} is ${format(p)}`,
        `The probability outside of ${lb} and ${rb} is ${format(pNot)}`,
        `The probability of ${lb} or less (≤${lb}) is ${format(pLessLb)}`,
        `The probability of ${rb} or more (≥${rb}) is ${format(pMoreRb)}`
      ].join('<br><br>');

      const confidence = [0.6828, 0.80, 0.90, 0.95, 0.98, 0.99, 0.995, 0.998, 0.999, 0.9999, 0.99999];
      const n = [1, 1.281551565545, 1.644853626951, 1.959963984540, 2.326347874041, 2.575829303549, 2.807033768344, 3.090232306168, 3.290526731492, 3.890591886413, 4.417173413469];
      const range = n.map(n => calc(`format(${m}-${s}*${n},{precision:5,notation:'fixed'})`) + ' – ' + calc(`format(${m}+${s}*${n},{precision:5,notation:'fixed'})`));
      confidenceIntervals = confidence.map((c,i) => {
        return `<td>${c}</td><td>${range[i]}</td><td>${n[i]}</td>`;
      });
    break;
  }

  // 3. output
  switch(type){
    case 'Probability of Two Events':
      for(let resultKey in result){
        _('result_'+resultKey).innerHTML = format(result[resultKey]);
      }
    break;
    case 'Probability Solver for Two Events': 
      _('result_solver').innerHTML = result;
    break;
    case 'Series of Independent Events': 
      _('result_events').innerHTML = result;
    break;
    case 'Normal Distribution': 
      _('result_distribution').innerHTML = result;
      confidenceIntervals.forEach((confidenceInterval,i) => {
        _('result_confidence_'+(i+1)).innerHTML = confidenceInterval;
      });
    break;
  }

}
