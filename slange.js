"use strict";
var snake_js = `\
"use strict";

const hastighed = 100;  // ms

const stoerrelse = 1024; // x og y
const maks_pos  = stoerrelse - 1; // sekvenser af tal gaar fra 0 til laengden - 1

const felter            = 32; // x og y
const felt_stoerrelse    = stoerrelse / felter;
const outline_stoerrelse = 2;

// https://en.wikipedia.org/wiki/Web_colors#Hex_triplet
const slangefarve             = 0x004545;
const slangeoutlinefarve      = 0x008F8F;
const slangehovedfarve        = 0x004545;
const slangehovedoutlinefarve = 0x00FFFF;
const baggrundsfarve          = 0x000010;
const madfarve                = 0x00FF00;
const tabefarve               = 0xFF1010;

const Retninger = {
	Hoejre:   {x:  felt_stoerrelse, y: 0},
	Venstre: {x: -felt_stoerrelse, y: 0},
	Op:      {x: 0,               y: -felt_stoerrelse},
	Ned:     {x: 0,               y:  felt_stoerrelse}
};

const tegner = PIXI.autoDetectRenderer(stoerrelse, stoerrelse, {antialias: true});
tegner.backgroundColor = baggrundsfarve;
document.body.appendChild(tegner.view);

// Tilfoej sidst det, som skal staa forrest.
// Dvs. tilfoej tekst sidst, for den skal altid kunne ses.
const scene   = new PIXI.Container();

const mad     = new PIXI.Graphics();
mad.beginFill(madfarve);
mad.drawRect(0, 0, felt_stoerrelse, felt_stoerrelse); // Firkantens fire koordinater.
mad.endFill();

scene.addChild(mad);

const slange  = new PIXI.Container(); // Samme type som 'scene'!
const slange_dele = slange.children; // Dens firkanter. Den sidste slange del er hovedet.

scene.addChild(slange);

const tekst_fundet = new PIXI.Text(
	0,
	{fontFamily: "verdana", fontSize: 64, fill: madfarve}
);
function stil_tekst_fundet() {
	tekst_fundet.y = stoerrelse - tekst_fundet.height; // Laeg det nede i bunden.
	tekst_fundet.x = stoerrelse - tekst_fundet.width;  // Laeg det i hoejre side.
}

scene.addChild(tekst_fundet);

const tekst_tabt_top = new PIXI.Text(
	"Du har tabt!",
	{fontFamily: "verdana", fontSize: 48, fill: tabefarve}
);
const tekst_tabt_bund = new PIXI.Text(
	"Tryk R for at genstarte.",
	{fontFamily: "verdana", fontSize: 48, fill: tabefarve}
);
// Goer dem usynlige
tekst_tabt_top.visible  = false;
tekst_tabt_bund.visible = false;
// Placer dem i midten
tekst_tabt_top.y = stoerrelse / 2 - tekst_tabt_top.height;
tekst_tabt_top.x = stoerrelse / 2 - tekst_tabt_top.width / 2;
tekst_tabt_bund.y = stoerrelse / 2;
tekst_tabt_bund.x = stoerrelse / 2 - tekst_tabt_bund.width / 2;

scene.addChild(tekst_tabt_top);
scene.addChild(tekst_tabt_bund);

// Kan aendres
let retning  = Retninger.Ned;
let har_tabt = false;

// http://help.adobe.com/en_US/AS2LCR/Flash_10.0/help.html?content=00000520.html
window.addEventListener("keydown", function(e) {
	switch (e.which) {
	case 68: // d
		retning = Retninger.Hoejre;
		break;
	case 65: // a
		retning = Retninger.Venstre;
		break;
	case 87: // w
		retning = Retninger.Op;
		break;
	case 83: // s
		retning = Retninger.Ned;
		break;
	case 77: // m
		forlaeng_slange();
		break;
	case 82: // r
		genstart();
		break;
	}
});

function forvandl_til_hoved(del) {
	del.beginFill(slangehovedfarve);
	
	del.lineStyle(outline_stoerrelse, slangehovedoutlinefarve);

	del.drawRect(0, 0, felt_stoerrelse, felt_stoerrelse);

	del.endFill();
}

function forvandl_til_kropsdel(del) {
	del.beginFill(slangefarve);
	
	del.lineStyle(outline_stoerrelse, slangeoutlinefarve);

	del.drawRect(0, 0, felt_stoerrelse, felt_stoerrelse);

	del.endFill();
}

function forlaeng_slange() {
	let sidste_hoved = slange_dele[slange_dele.length - 1]; // Tag det sidste element i sekvensen.
	forvandl_til_kropsdel(sidste_hoved);

	let hoved = new PIXI.Graphics();
	forvandl_til_hoved(hoved);
	hoved.x = sidste_hoved.x + retning.x;
	hoved.y = sidste_hoved.y + retning.y;
	
	slange.addChild(hoved);
	tegner.render(scene);
}

function flyt_tilfaeldigt(del) {
	// Math.random() giver et tal mellem 0 og 1. (Dvs. [0;1[)
	// Math.trunc() fjerner alle decimaltallene, dvs. 0.1 -> 0, 4.8 -> 4, -5.2 -> -5
	// Vi faar ud fra dette en position mellem 0 og antallet af felter. (Dvs. [0;felter])
	del.x = Math.trunc(Math.random() * felter) * felt_stoerrelse;
	del.y = Math.trunc(Math.random() * felter) * felt_stoerrelse;
}

function genstart() {
	slange.removeChildren(); // Toem den.

	let hoved = new PIXI.Graphics();
	forvandl_til_hoved(hoved);
	flyt_tilfaeldigt(hoved);

	slange.addChild(hoved);

	flyt_tilfaeldigt(mad);

	tekst_fundet.text = 0;
	stil_tekst_fundet();

	tekst_tabt_top.visible  = false;
	tekst_tabt_bund.visible = false;

	har_tabt = false;
}

function hold_koordinat_inde(x) {
	if (x > maks_pos) {
		return x - stoerrelse;
	} else if (x < 0) {
		return x + stoerrelse;
	} else {
		return x;
	}
}

function flyt_slange() {
	// Flyt alle delene, men ikke hovedet.
	let i = 0;
	while(i < slange_dele.length - 1) {
		slange_dele[i].x = slange_dele[i+1].x;
		slange_dele[i].y = slange_dele[i+1].y;
		i = i + 1;
	}

	// Flyt hovedet separat
	let hoved = slange_dele[slange_dele.length - 1];
	hoved.x = hold_koordinat_inde(hoved.x + retning.x);
	hoved.y = hold_koordinat_inde(hoved.y + retning.y);

	// Rammer hovedet nogle af sine egne kropsdele?
	i = 0;
	while(i < slange_dele.length - 1) {
		let del = slange_dele[i];
		if (hoved.x == del.x && hoved.y == del.y) {
			tekst_tabt_top.visible = true;
			tekst_tabt_bund.visible = true;
			har_tabt = true;
		}
		i = i + 1;
	}

	// Rammer hovedet mad?
	if (hoved.x == mad.x && hoved.y == mad.y) {
		let n = Number(tekst_fundet.text); // Konvertér til nummer
		tekst_fundet.text = n + 1;
		stil_tekst_fundet();

		flyt_tilfaeldigt(mad);
		forlaeng_slange();
	}
}

function loop() {
	// Flyt kun hvis man ikke har tabt
	if(!har_tabt) {
		flyt_slange();
	}
	tegner.render(scene);
}

genstart();

setInterval(loop, hastighed);
`
