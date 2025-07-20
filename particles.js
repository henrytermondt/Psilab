class Particle {
    static arr = [];
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 0;
    }

    static index = null;
    static resize = false;
    static selected = null;
    static select(override) {
        Particle.selected = null;
        Particle.resize = false;

        Particle.index = null;
        if (!override) {
            for (let i = 0; i < Particle.arr.length; i ++) {
                const p = Particle.arr[i];
                const drx = mx - (p.x + Math.cos(p.a) * p.r),
                    dry = my - (p.y + Math.sin(p.a) * p.r);
                if (drx * drx + dry * dry <= (6 / Particle.dim) ** 2) {
                    Particle.resize = true;
                    Particle.selected = p;
                    Particle.index = i;
                } else {
                    const dx = mx - p.x,
                        dy = my - p.y;
                    if (dx * dx + dy * dy <= p.r * p.r) {
                        Particle.selected = p;
                        Particle.index = i;
                    }
                }
            }
        } else {
            Particle.selected = override;
            Particle.index = Particle.arr.length - 1;
        }

        if (Particle.index !== null) {
            Particle.arr.push(Particle.arr.splice(Particle.index, 1)[0]);
            Particle.index = Particle.arr.length - 1;
            selectedEl.textContent = 'true';

            particleSliders[0].value = Particle.selected.x;
            particleSliders[1].value = Particle.selected.y;
            particleSliders[2].value = Particle.selected.a;
            particleSliders[3].value = Particle.selected.r;

            angleNum.textContent = Math.round(+particleSliders[2].value * 180 / Math.PI) + '°';

            for (const el of particleSliders) el.removeAttribute('disabled');
            deleteButton.style.filter = 'grayscale(0%)';
        } else {
            selectedEl.textContent = 'none';

            for (const el of particleSliders) el.disabled = 'disabled';

            deleteButton.style.filter = 'grayscale(100%)';
        }
    }
    static deselect() {
        Particle.resize = false;
        Particle.selected = Particle.index = null;

        selectedEl.textContent = 'none';
        for (const el of particleSliders) el.disabled = 'disabled';
        deleteButton.style.filter = 'grayscale(100%)';
    }
    static update() {
        pctx.clearRect(0, 0, Particle.dim, Particle.dim);

        pctx.save();
        pctx.scale(Particle.dim, Particle.dim);

        for (const p of Particle.arr) {
            p.display();
        }

        if (Particle.selected) Particle.selected.update();

        pctx.restore();
    }
    static getTotalState() {
        const totalState = [];
        for (const p of Particle.arr) {
            totalState.push(p.getState());
        }
        
        return totalState;
    }
    static dim = null;
}

class WavePacket extends Particle {
    constructor(x, y, radius=0.082, angle=0) {
        super(x, y);
        this.r = radius;
        this.a = angle;
    }
    update() {
        if (!dragging) return;
        
        if (Particle.resize) {
            const dx = mx - this.x,
                dy = my - this.y;
            this.r = Math.min(0.2, Math.max(0.04, Math.sqrt(dx * dx + dy * dy)));
            this.a = Math.atan2(-dy, -dx) + Math.PI;
        } else {
            this.x = mx;
            this.y = my;
        }
        
        changed = true;

        particleSliders[0].value = this.x;
        particleSliders[1].value = this.y;
        particleSliders[2].value = this.a;
        particleSliders[3].value = this.r;

        angleNum.textContent = Math.round(+particleSliders[2].value * 180 / Math.PI) + '°';
    }
    display() {
        if (Particle.selected === this) {
            pctx.strokeStyle = '#d25050';
            pctx.lineWidth = 4 / Particle.dim;
            pctx.beginPath();
            pctx.arc(
                this.x + Math.cos(this.a) * this.r,
                this.y + Math.sin(this.a) * this.r,
                8.5 / Particle.dim,
                0,
                Math.PI * 2
            );
            pctx.closePath();
            pctx.stroke();
        }

        pctx.fillStyle = 'rgb(225, 225, 225)';
        pctx.beginPath();
        pctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        pctx.closePath();
        if (Particle.selected === this) {
            pctx.lineWidth = 5 / Particle.dim;
            pctx.strokeStyle = '#d25050';
            pctx.stroke();
        }
        pctx.fill();

        pctx.fillStyle = 'rgb(200, 200, 200)';
        pctx.strokeStyle = 'rgb(225, 225, 225)';
        pctx.lineWidth = 4 / Particle.dim;
        pctx.beginPath();
        pctx.arc(
            this.x + Math.cos(this.a) * this.r,
            this.y + Math.sin(this.a) * this.r,
            6 / Particle.dim,
            0,
            Math.PI * 2
        );
        pctx.closePath();
        pctx.stroke();
        pctx.fill();
    }
    getState() {
        return [this.x, this.y, this.r, this.a];
    }

}

const addButton = document.getElementById('add-button'),
    deleteButton = document.getElementById('delete-button');
addButton.onclick = () => {
    const newParticle = new WavePacket(0.5, 0.5, 0.082, 0);
    Particle.arr.push(newParticle);
    Particle.select(newParticle);

    save();
};
deleteButton.onclick = () => {
    if (Particle.selected) {
        Particle.arr.splice(Particle.index, 1);

        Particle.deselect();
    }

    save();
};

const particleSliders = document.querySelectorAll('#particle-info input'),
    angleNum = document.getElementById('angle-num');
particleSliders[0].oninput = () => Particle.selected.x = +particleSliders[0].value;
particleSliders[1].oninput = () => Particle.selected.y = +particleSliders[1].value;
particleSliders[2].oninput = () => {
    Particle.selected.a = +particleSliders[2].value;
    angleNum.textContent = Math.round(+particleSliders[2].value * 180 / Math.PI) + '°';
}
particleSliders[3].oninput = () => Particle.selected.r = +particleSliders[3].value;