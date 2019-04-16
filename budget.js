var budd = document.querySelector('.front_page');

budd.width = window.innerWidth;
budd.height = window.innerHeight;

//BUDGET CONTROLLER
var budgetcontroller = (function(){
	
	var Expense = function(id ,description ,value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	
	Expense.prototype.calcPercentage = function(totalIncome){
		if( totalIncome > 0){
			this.percentage = Math.round((this.value/totalIncome)*100);
		}else{
			this.percentage = -1;
		}
	};
	
	Expense.prototype.getPercentages = function(){
		return this.percentage;
	};
	
	var Income = function(id ,description ,value){
		this.id = id;
		this.description = description;
		this.value = value;
	};
	
	var calctotals = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(cur){
			sum += cur.value;
		});
		data.totals[type] = sum;
	};
	
	var data = {
		allItems:{
			inc: [],
			exp: []
		},
		
		totals:{
			inc: 0,
			exp: 0
		},
		budget: 0,
		percentage: -1
	};
	
	return{
		addItem: function(type, des, val){
			
			var newItem, ID;
			
			if(data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}
			else{
				ID = 0;
			}
			
			if(type === 'inc'){
				newItem = new Income(ID, des, val);
			}
			else if(type === 'exp'){
				newItem = new Expense(ID, des, val);
			}
			
			data.allItems[type].push(newItem);
			
			return newItem;
		},
		
		deleteItem: function(type, id){
			var ids, index;
			
			ids = data.allItems[type].map(function(current){
				return current.id;
			});
			index = ids.indexOf(id);
			
			if(index !== -1){
				data.allItems[type].splice(index, 1);
			}
		},
		
		calculateBudget: function(){
			
			calctotals('inc');
			calctotals('exp');
			
			data.budget = data.totals.inc - data.totals.exp;
			if(data.totals.inc > 0){
			   data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
			}else{
				data.percentage = -1;
			}
		},
		
		calculatePercentage: function(){
			data.allItems.exp.forEach(function(cur){
				cur.calcPercentage(data.totals.inc);
			});
		},
		
		getPercentage: function(){
			var allPer = data.allItems.exp.map(function(cur){
				return cur.getPercentages();
			});
			return allPer;
		},
		
		getBudget: function(){
			return{
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		}
		
	};
	
})();

var UIcontroller = (function(){
	
	var formatNumber = function(num,type){
		var numSplit, int, dec, type;
		
		num = Math.abs(num);
		num = num.toFixed(2);
		
		numSplit = num.split('.');
		int = numSplit[0];
		if(int.length > 3){
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}
		
		dec = numSplit[1];
		
		return (type === 'exp' ? '-' :'+') + '' + int + '.' + dec;
		
	};
	
	var nodeListForEach = function(list, callback){
				for (var i = 0 ; i < list.length ; i++){
					callback(list[i], i);
				}
	};
	
	return{
	    getInput: function(){
			return{
				type: document.querySelector('.choose_option').value,
				description: document.querySelector('.add_discription').value,
				value: parseFloat(document.querySelector('.add_value').value)
            };	
	    },
		
		addListItem: function(obj, type){
			var html,newHtml,element;
			
			if(type === 'inc'){
				
				element = '.in_list';
				html = '<div class="item clearfix" id="inc-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"><button class="item_delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			else if(type === 'exp'){
				
				element = '.ex_list';
				html = '<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">%21</div><div class="item_delete"><button class="item_delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));
			
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		
		deleteListItem: function(selectorID){
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
			
		},
		
		clearfield: function(){
			var fields;
			fields = document.querySelectorAll('.add_discription' + ',' + '.add_value');
			
			var fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current, index, array){
				current.value = "";
			});
			fieldsArr[0].focus();
			
		},
		
		displayBudget: function(obj){
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector('.total_amount').textContent = formatNumber(obj.budget,type);
			document.querySelector('.income_amount').textContent = formatNumber(obj.totalInc,'inc');
			document.querySelector('.expense_amount').textContent = formatNumber(obj.totalExp,'exp');
			if( obj.percentage > 0){
				document.querySelector('.percentage').textContent = obj.percentage + '%';
			}
			else {
				document.querySelector('.percentage').textContent = '---';
			}
		},
		
		displayPercentage: function(percentages){
			var field = document.querySelectorAll('.item_percentage');
									
			nodeListForEach(field, function(current, index){
				if(percentages[index] > 0){
					current.textContent = percentages[index] + '%';
				}else{
					current.textContent = '---';
				}
			});
		},
		
		displayMonth: function(){
			var now, month, year, months;
			months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
			now = new Date();
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector('.month_name').textContent = months[month] +' ' + year;
			
		},
		
		changeType: function(){
			var fields = document.querySelectorAll(
			  '.add_discription' + ',' + '.add_value' + ',' + '.choose_option'
			);
			
			nodeListForEach(fields,function(cur){
				cur.classList.toggle('red-focus');
			});
			
			document.querySelector('.btn').classList.toggle('red');
			
		}
			
    };
	
})();

var controller = (function(bgctrl,UIctrl){
	
	var setupEvent = function(){
			
		document.querySelector('.btn').addEventListener('click',ctrlAddItem);
		document.addEventListener('keypress',function(event){
			if( event.keycode === 13 || event.which === 13)
			{
				ctrlAddItem();
			}
		});
		document.querySelector('.container').addEventListener('click',ctrlDelItem);
		document.querySelector('.choose_option').addEventListener('change',UIctrl.changeType);
		
	};
	
	var updateBudget = function(){
		
		bgctrl.calculateBudget();
	    var budget = bgctrl.getBudget();
		
		UIctrl.displayBudget(budget);
		
	};
	
	var updatePercentage = function(){
		bgctrl.calculatePercentage();
		var percentages = bgctrl.getPercentage();
		UIctrl.displayPercentage(percentages);
	};
	
	var ctrlAddItem = function(){
		
		var input = UIctrl.getInput();
		
		if(input.description !== "" && !isNaN(input.value) && input.value > 0){
			var newItem = bgctrl.addItem(input.type, input.description ,input.value);
			UIctrl.addListItem(newItem, input.type);
			UIctrl.clearfield();
			updateBudget();
			updatePercentage();
		}
		
	};
	
	var ctrlDelItem = function(){
		var itemId,splitId,type,ID;
		
		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemId){
			
			splitId = itemId.split('-');
			type = splitId[0];
			ID = parseInt(splitId[1]);
			bgctrl.deleteItem(type,ID);
			UIctrl.deleteListItem(itemId);
		    updateBudget();
			updatePercentage();
			
		}
	};
	
	return{
		init: function(){
			UIctrl.displayMonth();
			UIctrl.displayBudget({
			    budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEvent();
		}
	};
	
})(budgetcontroller,UIcontroller);

controller.init();


