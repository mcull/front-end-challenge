
function domobj(){
  var self        =this;
  self.products   = [];

  self.getproducts = function(url, callback){
    $.getJSON(url, function(response){
        for(i=0; i<response.sales.length ; i++){
          self.products.push( new productobj(response.sales[i], i)  );
        }
        if (typeof callback === "function") {
          callback();
        }
    });
  }

  self.updateproducthtml = function(){
    for( i=0; i< self.products.length ; i++){
      self.products[i].updatehtml();
    }
  }

  self.updatedom = function(){
    var i=0
    thishtml='';
    $("#content").html(thishtml);
    var prodCounter = 0;
    thishtml += "<div class='row'>";
    for( i=0; i< self.products.length ; i++){
      if (self.products[i].active) {
        thishtml += self.products[i].htmlview;
      }
    }
    thishtml += "</div>";
    $("#content").append(thishtml);
    $('.product-container').hover(function(){
      $(this).find('.overlay:first').show();
    },function(){
      $(this).find('.overlay:first').hide();
    });

    $('.closer').click(function(){
      $(this).closest('.product-container').slideUp(function() {
        self.products[$(this).attr("rel-data-id")].active = false;
        self.updatedom();
      });
    });
  }
}

function productobj(product, i){
  var self          = this;
  self.photo        = product.photos.medium_half
  self.title        = product.name
  self.description  = product.description
  self.tagline      = product.tagline
  self.url          = product.url
  self.htmlview     = ""
  self.index        = i
  self.custom_class = "col"+ ((i % 3) +1)
  self.active       = true;

  self.updatehtml= function(){
      self.htmlview = template.replace('{image}', self.photo).replace('{title}', self.title).replace('{tagline}', self.tagline).replace('{url}', self.url).replace('{custom_class}', self.custom_class).replace('{description}', self.description).replace('{id}',self.index);
  }
}


var page=new domobj();
var template = null;

/*
** CHANGE TO EXECUTION FLOW **
Going to fetch the product template first.  No need to keep calling back to the
server for each product.  We'll get the template once and store it in
a globally-accessible variable.  This just doesn't bother me at all.

template.replace doesn't change the value in-place, so it's safe to
use over and over again, no need for a fresh copy.

Once we have the template, we'll proceed to fetch the products data.

I'm serializing the call stack to honor the dependency chain that
the timeouts were trying to accomodate.  I'm doing that by passing a
callback to the getproduct function.  Now, the products won't be
told to update thier html until the product data has been fetched and the
setup work is finished.  Realize that callbacks make the code a little
harder to read, but in this case the peace of mind from the predictable
execution is worth it.
*/
function initPage() {
  $.get('product-template.html', function(data){
    template = data;
    //now go get the products
    page.getproducts('data.json', function() {
      page.updateproducthtml();
      page.updatedom()
    });
  });
}

/*
* The page shouldn't actually take long to loag now, but there's a spinner
* animation to handle the case where it does.  To force it, call /#delay, which
* will force the page to wait 2 seconds before starting.  Obviously this block
* is not part of the "production-inspired" code, but does demonstrate facility for
* exposing/testing non-functional specs that aren't part of the happy path.
*/
var delay = (window.location.hash.substr(1) == "delay") ? 2000 : 0;
window.setTimeout(function(){
  initPage();
}, delay);

//page.getproducts('data.json');
//setTimeout("console.log('building html');page.updateproducthtml();",20);
//setTimeout("page.updatedom()",50)
