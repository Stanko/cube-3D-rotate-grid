var Cube = function() {
	this.el = {
		body: $('body'),
		cubeWrappers: $('.CubeWrapper'),
	};

	this.styles = [
		'.Cube { transform-origin: center center NEGATIVE_HALF; line-height: FULL; }',
		'.Cube-side--top { transform: rotateX(90deg) translate3d(0, NEGATIVE_HALF, HALF); }',
		'.Cube-side--bottom { transform: rotateX(-90deg) translate3d(0, HALF, HALF); }',
		'.Cube-side--left { transform: rotateY(-90deg) translate3d(NEGATIVE_HALF, 0, HALF); }',
		'.Cube-side--right { transform: rotateY(90deg) translate3d(HALF, 0, HALF) }',
		// '.Cube-side--back { transform: rotateY(180deg) translate3d(0, 0, FULL); }'
	].join('\n');

	this.options = {
		transitionTime: 300
	};

	this.init();
	this.bind();
};

Cube.prototype.init = function() {
	// Add <style> shich needs to updated on window resize
	this.el.style = $('<style />').attr('id', 'CubeStyle');
	this.el.body.append(this.el.style);

	this.fixTranforms();

	this.state = [];

	for (var i = 0; i < this.el.cubeWrappers.length; i++) {
		this.state.push({
			rotationCount: 0,
			mouseOut: true,
			transitionInProgress: false
		});
	}
};

Cube.prototype.bind = function() {
	var self = this;

	var resizeTimeout;

	$(window).resize(function() {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(function(){
			self.fixTranforms();
		}, 500);
	});

	this.el.cubeWrappers.hover(function(e) {
		self.onMouseEnter(e, $(this));
	}, function(e) {
		self.onMouseOut(e, $(this));
	});
};

Cube.prototype.fixTranforms = function() {
	var size = $('.CubeWrapper')[0].getBoundingClientRect().width;
	var half = size / 2;

	var newStyles = this.styles
		.replace(/FULL/g, size + 'px')
		.replace(/NEGATIVE_HALF/g, -half + 'px')
		.replace(/HALF/g, half + 'px');

	this.el.style.html(newStyles);
};

Cube.prototype.onMouseOut = function(e, element) {
	this.state[element.index()].mouseOut = true;
};

Cube.prototype.onMouseEnter = function(e, element) {
	var state = this.state[element.index()];

	if (!state.mouseOut || state.transitionInProgress) {
		return;
	}

	state.mouseOut = false;
	state.rotationCount++;

	var cube = element.find('.Cube');

	var rotation;
	var side;

	var elLeft = cube.offset().left;
	var elRight = elLeft + cube.width();
	var elTop = cube.offset().top;
	var elBottom = elTop + cube.height();

	var left = e.pageX - elLeft;
	var right = elRight - e.pageX;
	var top = e.pageY - elTop;
	var bottom = elBottom - e.pageY;

	var min = Math.min(top, bottom, left, right);

	switch (min) {
		case top:
		rotation = {
			x: -90,
			y: 0
		};
		side = 'top';
		break;
		case bottom:
		rotation = {
			x: 90,
			y: 0
		};
		side = 'bottom';
		break;
		case left:
		rotation = {
			y: 90,
			x: 0
		};
		side = 'left';
		break;
		case right:
		rotation = {
			y: -90,
			x: 0
		};
		side = 'right';
		break;
	}


	var invertClass = state.rotationCount % 2 === 1 ? 'Cube-side--invert' : '';
	var sideClass = 'Cube-side--' + side;

	var oldSide = element.find('.Cube-side');
	var newSide = $('<div/>')
		.addClass('Cube-side ' + sideClass)
		.addClass(invertClass)
		.html(oldSide.html());

	oldSide.after(newSide);

	state.transitionInProgress = true;
	cube.css('transition', 'all ' + (this.options.transitionTime/1000) + 's linear')
		.css('transform', 'rotateX(' + rotation.x + 'deg) rotateY(' + rotation.y + 'deg)');

	setTimeout(function() {
		oldSide.remove();
		newSide.removeClass(sideClass).addClass('Cube-side--front');
		cube.css('transition', 'none').css('transform', 'none');
		state.transitionInProgress = false;
	}, this.options.transitionTime);
};


$(function() {
	var cube = new Cube();
});