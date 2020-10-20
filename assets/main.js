const Block = function(Ri, Ro, Av, NF, IIP3) {
    this.Ri   = Ri;
    this.Ro   = Ro;
    this.Av   = Av;
    this.NF   = NF;
    this.IIP3 = IIP3;
    // Gp = Po/Pi = (Vo^2/2*Ro)/(Vi^2/2*Ri) = [(Vo/Vi)^2]*[Ri/Ro] = [Av^2]*[Ri/Ro]
    this.Gp   = Math.pow(this.Av, 2) * (this.Ri/this.Ro);
};

const controller = {
    values: {
        Av  : null,
        NF  : null,
        IIP3: null
    },
    
    // in sequences
    blocks: [],
    
    methods: {
        calcAv: function() {
            let tmp = 1;
            controller.blocks.forEach((b, i) => {
                tmp *= b.Av;
            });
            return (controller.blocks.length == 0) ? null : tmp;
        },
        calcNF: function() {
            let tmp = 1;
            controller.blocks.forEach((b, i) => {
                let den = 1;
                for(let j=0; j<i; j++) {
                    den *= controller.blocks[j].Gp;
                }
                tmp += (b.NF - 1) / den;
            });
            return (controller.blocks.length == 0) ? null : tmp;
        }, 
        calcIIP3: function() {
            let tmp = 0;
            controller.blocks.forEach((b, i) => {
                let num = 1;
                for(let j=0; j<i; j++) {
                    num *= Math.pow(controller.blocks[j].Av, 2);
                }
                tmp += num / Math.pow(b.IIP3, 2);
            });
            return (controller.blocks.length == 0) ? null : Math.pow(tmp, -0.5);
        },
        todB: function(isPower, value) {
            return isPower ? 10*Math.log10(value) : 20*Math.log10(value);
        },
        toReal: function(isPower, dB) {
            return isPower ? Math.pow(10, dB/10) : Math.pow(10, dB/20);
        },
        todBm: function(value) {
            return 10*Math.log10(value/0.001);
        },
        dBmtoReal: function(dBm) {
            return Math.pow(10, (dBm-30)/10);
        },
        createBlock: function(Ri, Ro, Av, NF, IIP3) {
            controller.blocks.push(new Block(Ri, Ro, Av, NF, IIP3));
        }
    }
};

Block.prototype.todB = controller.methods.todB;
Block.prototype.toReal = controller.methods.toReal;
Block.prototype.todBm = controller.methods.todBm;
Block.prototype.dBmtoReal = controller.methods.dBmtoReal;


let a=null, b=null, c=null, d=null, e=null, f=null, g=null, h=null, i=null, j=null;

function change(x) {
    switch(x.id) {
        case 'a':
            a = controller.methods.toReal(true, document.getElementById(x.id).value);
            break;
        case 'b':
            b = controller.methods.toReal(false, document.getElementById(x.id).value);
            break;
        case 'c':
            c = controller.methods.toReal(true, document.getElementById(x.id).value);
            break;
        case 'd':
            d = controller.methods.dBmtoReal(document.getElementById(x.id).value);
            break;
        case 'e':
            e = controller.methods.toReal(false, document.getElementById(x.id).value);
            break;
        case 'f':
            f = controller.methods.toReal(true, document.getElementById(x.id).value);
            break;
        case 'g':
            g = controller.methods.dBmtoReal(document.getElementById(x.id).value);
            break;
        case 'h':
            h = controller.methods.toReal(false, document.getElementById(x.id).value);
            break;
        case 'i':
            i = controller.methods.toReal(true, document.getElementById(x.id).value);
            break;
        case 'j':
            j = controller.methods.dBmtoReal(document.getElementById(x.id).value);
            break;
        default:
            console.log('oops...');
    }
    
    // clean
    controller.blocks = [];
        
    // RFfilter gain = -1dB IIP3 = 100dBm
    //               [Ri, Ro, Av, NF, IIP3];
    const RFfilter = [50, 50, controller.methods.toReal(false, -1), a, controller.methods.dBmtoReal(100)];
    const LNA      = [50, 50, b, c, d];
    const Mixer    = [50, 400, e, f, g];
    const IFfilter = [400, 400, h, i , j];

    controller.methods.createBlock(...RFfilter);
    controller.methods.createBlock(...LNA);
    controller.methods.createBlock(...Mixer);
    controller.methods.createBlock(...IFfilter);

    controller.values.Av = controller.methods.calcAv();
    controller.values.NF = controller.methods.calcNF();
    controller.values.IIP3 = controller.methods.calcIIP3();
    document.getElementById('Av').innerHTML = controller.methods.todB(false, controller.values.Av);
    document.getElementById('NF').innerHTML = controller.methods.todB(true, controller.values.NF);
    document.getElementById('IIP3').innerHTML = controller.methods.todBm(controller.values.IIP3);
}