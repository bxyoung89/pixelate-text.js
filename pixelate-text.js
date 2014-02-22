var pixelateText = (function(){


	function PixelateText(){

	}


	PixelateText.prototype.pixelate = function(target, typeface){
		if(!target){
			throw "Cannot pixelate an empty target";
			return;
		}
		if(!typeface){
			throw "Cannot pixelate without a typeface";
			return;
		}
		if(d3.selectAll(target).empty()){
			throw "Cannot pixelate an empty target";
			return;
		}

		var pixelSize = determineSizeOfPixel(target, typeface);
		d3.selectAll(target).each(function(){
			var myTarget = d3.select(this);
			var myTargetParent = d3.select(myTarget.node().parentNode);
			if(myTargetParent.select("svg").empty()){
				myTargetParent.append("svg")
					.attr("height", myTarget.attr("height"))
					.attr("width", myTarget.attr("width"));
			}
			else{
				myTargetParent.select("svg").selectAll("g").remove();
			}
			myTarget.remove();
			var svg = myTargetParent.select("svg");
			svg = svg.append("g");
			var text = myTarget.text();
			var data = makeLetterVms(text, pixelSize, typeface);
			svg.selectAll("g.letter")
				.data(data)
				.enter()
				.append("g")
				.classed("letter", true)
				.attr("transform", function(d){
					return "translate ("+ d.start+", 0)";
				})
				.selectAll("rect.pixel")
				.data(function(d){
					return d.pixels;
				})
				.enter()
				.append("rect")
				.classed("pixel", true)
				.attr("x", function(d){
					return d.x * pixelSize;
				})
				.attr("y", function(d){
					return d.y * pixelSize;
				})
				.attr("height", pixelSize)
				.attr("width", pixelSize)
				.attr("fill", function(d){
					return typeface.colors[d.color];
				});
		});


	};

	function determineSizeOfPixel(target, typeface){
		var lineHeight = d3.selectAll(target).style("line-height").replace("px", "") * 1;
		var fontSize = d3.selectAll(target).style("font-size").replace("px", "") * 1;
		var height = d3.selectAll(target).style("height").replace("px", "") * 1;
		return fontSize/typeface.gridHeight;
	}

	function makeLetterVms(text, sizeOfPixel, typeface){
		var letters = [];
		for(var x = 0; x < text.length; x++){
			var letter = text.charAt(x);
			var vm = {
				letter: letter,
				index: x,
				width: (typeface.gridWidth + 1) * sizeOfPixel,
				start: x * (typeface.gridWidth + 1) * sizeOfPixel
			};

			var matchingLetter = getMatchingLetter(letter, typeface);
			vm.pixels = matchingLetter === undefined ? [] : matchingLetter.pixels;
			letters.push(vm);
		}
		return letters;
	}

	function getMatchingLetter(letter, typeface){
		var matchingLetters = typeface.letters.filter(function(typefaceLetter){
			return typefaceLetter.character === letter;
		});
		if(matchingLetters.length > 0){
			return matchingLetters[0];
		}

		var matchingUppercaseLetters = typeface.letters.filter(function(typefaceLetter){
			return typefaceLetter.character === letter.toUpperCase();
		});
		if(matchingUppercaseLetters.length >0){
			return matchingUppercaseLetters[0];
		}

		var matchingLowercaseLetters = typeface.letters.filter(function(typefaceLetter){
			return typefaceLetter.character === letter.toLowerCase;
		});
		if(matchingLowercaseLetters.length > 0){
			return matchingLowercaseLetters[0];
		}

		return undefined;
	}


	return new PixelateText();
}());