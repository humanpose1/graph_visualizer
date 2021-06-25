
var activatedCut = false;

function changeCut() {
  if(toggle == 1) {
    activatedCut = !activatedCut;
    if(activatedCut){
      document.body.style.cursor = "crosshair";
    }
    else{
      document.body.style.cursor = "default";
    }
  }
  else {
    activatedCut = false;
    document.body.style.cursor = "default";
  }
}
