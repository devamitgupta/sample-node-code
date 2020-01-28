$(document).ready(function () {
  $('.error-bar').hide();
  let finalProducts;
  let pricingHtml = '';
  let featureHtml = '';
  let productHtml = '';
  let days = 31;
  $('.step2').hide();
  $('.step3').hide();
  $('.loader').hide();
  let lang = $('#lang').val() === 'ar' ? 'ar' : 'en';

  /*******************Select Country****************/
  $('.step1 .sel-country-type li').click(function () {
    featureHtml = '';
    productHtml = '';
    pricingHtml = '';
    $('.loader').show();
    $('.step2').hide();
    $('.step3').hide();
    $(this).addClass('active').siblings().removeClass('active');
    let selectedMarketSpan = $(this).find('span').attr('id');
    let selectedMarket = selectedMarketSpan === 'kw' ? 'kse' : selectedMarketSpan === 'ksa' ? 'tadawul' : '';
    let version = selectedMarket === 'kse' ? 2 : 1;

    /**************Getting market packages details*********/
    $.get($('#url').val() + '?market=' + selectedMarket + '&version=' + version, function (data) {
      $('.loader').hide();

      finalProducts = data;

      if (finalProducts.length) {
        $.each(finalProducts, function (index, x) {
          featureHtml = '';
          $.each(x.features, function (i, x) {
            if (x.title.en.includes('orderbook')) {
              featureHtml += '<p class="hl"><i></i>' + x.title[lang] + '</p>';
            } else {
              featureHtml += '<p><i></i>' + x.title[lang] + '</p>';
            }
          });
          pricingHtml = '<span><span class="currency">' + x.items[0].currency + '</span>' + x.items[0].price + '<span class="duration">/ mo</span></span>';
          '<li  >'
          productHtml += '<li id="' + index + '"><h4 class="mb-3">' + x.name + '</h4><p class="mb-0 description">' + x.description[lang] + '</p><div class="price" >' + pricingHtml + '</div><div class="feature-list">' + featureHtml + '</div><div class="sel-button"><button>Select</button></div></li>';
        })
        $('.leftspecial-pro').html(productHtml);
      } else {
        $('.pro-pricing-main').html('<h2>No Records to display.</h2>');
      }
      $('.step2').show();
      $('body').animate({
        scrollTop: eval($('#priceStep').offset().top - 10)
      }, 1000);
    });
  });

  $(document).on('click', '.leftspecial-pro li', function () {
    $(this).addClass('active').siblings().removeClass('active');
    $('.step3').show();
    $('body').animate({
      scrollTop: eval($('#payment').offset().top - 20)
    }, 1000);
  });

  $(document).on('change', '#duration-selector', function () {
    days = parseInt(this.value, 10);
    let duration = '';
    switch (days) {
      case 31:
        duration = 'mo';
        break;
      case 93:
        duration = '3 mo';
        break;
      case 184:
        duration = '6 mo';
        break;
      case 366:
        duration = '1 yr';
        break;
      default:
        break;
    }
    pricingHtml = '';
    productHtml = '';
    $.each(finalProducts, function (index, x) {
      featureHtml = '';
      $.each(x.features, function (i, t) {
        if (t.title.en.includes('orderbook')) {
          featureHtml += '<p class="hl"><i></i>' + t.title[lang] + '</p>';
        } else {
          featureHtml += '<p><i></i>' + t.title[lang] + '</p>';
        }
      });
      $.each(x.items, function (i, x) {
        if (x.duration === days) {
          pricingHtml = '<span><span class="currency">' + x.currency + '</span>' + x.price + '<span class="duration">/ ' + duration + '</span></span>';
        }
      });
      productHtml += '<li id="' + index + '"><h4 class="mb-3">' + x.name + '</h4><p class="mb-0 description">' + x.description[lang] + '</p><div class="price" >' + pricingHtml + '</div><div class="feature-list">' + featureHtml + '</div><div class="sel-button"><button>Select</button></div></li>';
    });
    $('.leftspecial-pro').html(productHtml);
  });

  $(document).on('click', '.step3 li.knet', function () {
    $('.error-bar').hide();
    $('.loader').show();
    if (localStorage.getItem('restToken') && localStorage.getItem('restToken').trim() !== 'null' && localStorage.getItem('restToken').trim() !== '' ) {
      $.ajax({
        type: 'POST',
        url: '/checkUserAuthState',
        dataType: "json",
        data: { token: localStorage.getItem('restToken') },
        success: function (data) {
          $('.loader').hide();
          if (!data.success) {
            $('#myModal').modal();
          } else {
            let sel = $('.leftspecial-pro li.active').attr('id');
            let selectProductGroup = finalProducts[sel].items.filter(function (x) {
              return x.duration === days
            });
            subscribe('/subscribeUsingKnet', { product: selectProductGroup[0] });
          }
        },
        error: function (error) {
          $('.loader').hide();
          console.log('error------------->', error);
        }
      });
    } else {
      $('.loader').hide();
      $('#myModal').modal();
    }
  });

  $('#myModal').on('hidden.bs.modal', function () {
    $('#loginForm')[0].reset();
    $('.loader').hide();
    $('.error-bar').hide();
    $('span.authError').hide();
  })

  $('#loginForm').validate({
    debug: false,
    errorClass: "authError",
    errorElement: "span",
    rules: {
      username: {
        required: true,
      },
      password: {
        required: true
      }
    },
    messages: {
      username: {
        required: 'Please enter your username'
      },
      password: {
        required: 'Please enter your password'
      }
    },
    highlight: function (element, errorClass) {
      $(element).removeClass(errorClass);
    },
    submitHandler: function (form, e) {
      $('.error-bar').hide();
      $('.loader').show();
      e.preventDefault();
      var formObj = {};
      var inputs = $('#loginForm').serializeArray();
      $.each(inputs, function (i, input) {
        formObj[input.name] = input.value;
      });
      let sel = $('.leftspecial-pro li.active').attr('id');
      let selectProductGroup = finalProducts[sel].items.filter(function (x) {
        return x.duration === days
      });
      formObj.product = selectProductGroup[0];
      subscribe('/subscribeUsingKnetWithAuth', formObj);
    }
  });

  function subscribe(url, obj) {
    $.ajax({
      type: 'POST',
      url: url,
      dataType: "json",
      data: obj,
      success: function (result) {
        $('.loader').hide();
        if (result.success) {
          window.location.replace(result.message);
        }
      },
      error: function (error) {
        let errorText = '';
        $('.loader').hide();
        $('.error-bar').show();
        if (error.responseJSON.error.message) {
          $('.error-bar').text(error.responseJSON.error.message)
        } else if (Object.keys(error.responseJSON.error).length) {
          if (error.responseJSON.error.length === 2) {
            errorText = 'Please enter your username and password.'
          } else {
            $.each(error.responseJSON.error, function (i, x) {
              errorText = 'Please enter your ' + x.param + '.';
            });
          }
          $('.error-bar').text(errorText);
        }
      }
    });
  }
});