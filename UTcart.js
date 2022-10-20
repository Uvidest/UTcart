let drawer_cart = document.getElementsByClassName("cart_wrapper")[0];
let cart_overflow = document.getElementById("cart_items");
let body = document.getElementsByTagName("body")[0];
let container = document.getElementsByClassName("cart_container_drower")[0];
let out_in_stock = document.getElementsByClassName("out_in_stock")[0];
let string = document.querySelector("#all_variant_track").innerHTML;
let cart_upsell = document.getElementsByClassName("upsell")[0];

const handleAddToCart = (el) => {
  let varId =
    document.getElementById(`varId-${el.dataset.inputid}`).value ||
    window.location.search.substr(1).split("variant=")[1];
  let quantity =
    document.getElementById(`product_quantity-${el.dataset.inputid}`)?.value ||
    1;
  let productParams = JSON.parse(string)
    .split(varId)[1]
    .split(",")[0]
    .split(":")[1]
    ?.split("}")[0];
  let selling_state = productParams.split("-")[1].split('"')[0];
  let availableQuantity = productParams.split("-")[0].split('"')[1];
  let formData = {
    items: [
      {
        id: +varId,
        quantity: +quantity,
      },
    ],
  };

  fetch(window.Shopify.routes.root + "cart.js", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((el) => {
      if (selling_state === "deny") {
        if (+quantity > +availableQuantity) {
          out_in_stock.style.display = "unset";
          out_in_stock.innerHTML = `Available quantity on stock - ${availableQuantity}`;
        } else {
          if (el.items.length == 0) {
            if (+quantity > +availableQuantity) {
              out_in_stock.style.display = "unset";
              out_in_stock.innerHTML = `Available quantity on stock - ${availableQuantity}`;
            } else {
              addToCartRequest(formData);
            }
          } else {
            let product = el.items.find(
              ({ variant_id }) => variant_id === +varId
            );
            if (
              product?.quantity == +availableQuantity ||
              product?.quantity + formData.items[0].quantity >
                +availableQuantity
            ) {
              out_in_stock.innerHTML = `Available quantity on stock - ${availableQuantity}`;
              out_in_stock.style.display = "unset";
            } else {
              addToCartRequest(formData);
            }
          }
        }
      } else {
        addToCartRequest(formData);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
const addToCartRequest = (formData) => {
  out_in_stock.style.display = "none";

  fetch(window.Shopify.routes.root + "cart/add.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      openCart();
      return response.json();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
const getCartItems = () => {
  let upsellArr = [];
  let productsTag = [];

  fetch(window.Shopify.routes.root + "cart.js", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((el) => {
      findProductByHandle(el, upsellArr, productsTag);
      drawItems(el);
      drawUpsell(el);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
const updateItem = (id, qty) => {
  let upsellArr = [];

  let productsTag = [];
  document
    ?.getElementById(`quantity_minus-${id}`)
    .classList.add("disabled_button");
  document
    ?.getElementById(`quantity_plus-${id}`)
    .classList.add("disabled_button");
  document.getElementById(`loaderId-${id}`).style.display = "unset";

  let formData = {
    updates: {
      [`${id}`]: qty,
    },
  };
  fetch(window.Shopify.routes.root + "cart/update.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      return response.json();
    })
    .then((el) => {
      findProductByHandle(el, upsellArr, productsTag);
      drawItems(el);
      drawUpsell(el);
      if (qty !== 0) {
        document.getElementById(`loaderId-${id}`).style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
const drawItems = (el) => {
  cart_overflow.innerHTML = "<div></div>";
  document.getElementById("cart_count").innerHTML = el?.item_count;

  let product_item;
  if (el.item_count > 0) {
    let currencySymbol = document.querySelector("body").dataset.currencysymbol;
    let shipping_bar_id = document.getElementById("shipping_bar_id");

    let need_to_pay = document.getElementById("need_to_pay");
    let shipping_title = document.getElementById("shipping_title");

    document.getElementById("cart_footer").style.display = "unset";
    document.getElementById("total_checkout_price").innerHTML =
      currencySymbol + " " + (el?.total_price / 100).toFixed(2);
    +" " + el?.currency;
    cart_upsell.style.display = "unset";
    cart_upsell.style.filter = "none";

    shipping_bar_id.style.display = "flex";
    return el?.items.map((data) => {
      let productParams = JSON.parse(string)
        .split(data.variant_id)[1]
        .split(",")[0]
        .split(":")[1]
        .split("}")[0];
      let productCap = productParams.split("cap=")[1];
      let availableQuantity = productParams.split("-")[0].split('"')[1];
      let selling_state = productParams.split("-")[1].split('"')[0];
      product_item = document.createElement("div").innerHTML = `
      <div class="cart_item">
      <div class="item--loadbar" id="loaderId-${data.variant_id}">
        <div class="loaderCart">&nbsp;</div>
      </div>

      <div class="image"> 
          <img 
            src=${data.featured_image.url}
            alt=${data.featured_image.alt}
            loading="lazy"
          >
 
      </div>
      <div class="info_drawer">
        <div>
          <div class="info_item"> 
            <a href=${data.url}>${data.product_title}</a>
          </div>
          <div class="info_item">          
                <div>${
                  currencySymbol + (data.price / 100).toFixed(2)
                }</div>           
           </div>
          <div class="info_item options_product">
              ${data.options_with_values?.map(
                ({ name, value }) => `<div>${name + ":" + value}</div>`
              )}        
          </div>
          <div class="actions_drawer">
          <div>
                <quantity-input class="quantity_selector qty_sel">
                  <button onclick="updateItem(${data.variant_id},${
        data.quantity - 1
      })" id='quantity_minus-${
        data.variant_id
      }' class="no-js-hidden" name="minus" type="button">
                    <span></span>
                    - 
                    </button>
                    <input
                    class='quantity_input'
                    type="number"
                    name="updates[]"
                    readonly='false'
                    value=${data.quantity}
                    min="0"
                    id=${data.variant_id}
                  />
                  <button onclick="updateItem(${data.variant_id},${
        data.quantity + 1
      })" id='quantity_plus-${
        data.variant_id
      }' class="no-js-hidden" name="plus" type="button">
                    <span class="visually-hidden"></span>
                      +
                    </button>
                </quantity-input>
                </div>
            <div class="remoove">
              <cart-remove-button>
                <button class="remoove_button" onclick="updateItem(${
                  data.variant_id
                },0)">
                Remove
                </button>
              </cart-remove-button>
            </div>
          </div>
      

          
        </div>


        <div class="upsell_price_wrapper_UT"> 
        <div class="upsell_cap_price_UT">   
         ${currencySymbol + (+productCap / 100).toFixed(2)}
        </div>
        
         <div class="upsell_price_UT">   
         ${data.original_price / 100 !== data.final_price? `
         <div>
           <div>
            <strong class='final_price'>${
              currencySymbol + data.final_line_price.toFixed(2) / 100
            }</strong>
            </div>
         </div>`
             : ""}
          </div>
        </div>

      
      </div>
      
      </div>`;
      cart_overflow.innerHTML += product_item;
      if (selling_state === "deny") {
        if (+data.quantity == +availableQuantity) {
          document
            ?.getElementById(`quantity_plus-${data.variant_id}`)
            ?.classList.add("disabled_button");
        }
      }
      if (el.total_price.toFixed(2) / 100 < shipping_bar_id.max) {
        shipping_bar_id.value = el.total_price.toFixed(2) / 100;

        need_to_pay.innerHTML =
          currencySymbol +
          (shipping_bar_id.max - el.total_price.toFixed(2) / 100).toFixed(2);

        shipping_title.innerHTML = "For get free shipping!";
      } else {
        shipping_bar_id.value = el.total_price.toFixed(2) / 100;
        shipping_title.innerHTML =
          "Congratulations! Your order qualifies for free shipping";
        need_to_pay.innerHTML = "";
      }
    });
  } else {
    cart_upsell.style.display = "none";
    shipping_bar_id.style.display = "none";

    product_item = document.createElement("div").innerHTML = `
      <div class='empty_cart_box'>
        <h2 class='empty_title'>Your cart is empty</h2>
          <a href='/collections/all' class="footer_button_checkout" id="CartDrawer-Checkout">
           Continue shopping
          </a>
      </div>`;
    document.getElementById("cart_footer").style.display = "none";
    cart_overflow.innerHTML += product_item;
  }
};
const openCart = () => {
  getCartItems();
  drawer_cart.classList.add("active_drawer");
  body.classList.add("overflow-hidden");
  drawer_cart.style.display = "flex";

  setTimeout(() => {
    container.style.transform = "translate(0%)";
  }, 200);
  setTimeout(() => {
    cart_upsell.style.transform = "translate(0%)";
  }, 350);
};
const outsideClick = () => {
  const specifiedElement = document.getElementById("outside_overlay");
  document.addEventListener("click", (event) => {
    if (event.target.id === specifiedElement.id) {
      closeCart();
    }
  });
};
const closeCart = () => {
  setTimeout(() => {
    cart_upsell.style.transform = "translate(100%)";
  }, 200);
  setTimeout(() => {
    container.style.transform = "translate(100%)";
  }, 400);
  setTimeout(() => {
    drawer_cart.style.display = "none";
    drawer_cart.classList.remove("active_drawer");
    body.classList.remove("overflow-hidden");
  }, 550);
};
const changeUpsellVariant = (el) => {
  let currencySymbol = document.querySelector("body").dataset.currencysymbol;

  let itemWrapper = el.closest(".product_item");
  let productObjWrapper = el
    .closest(".product_item")
    .querySelector(".product_object").innerHTML;
  let productObj = JSON.parse(productObjWrapper).product.variants;
  let variantTitle = "";
  itemWrapper.querySelectorAll("form select").forEach((select) => {
    variantTitle += variantTitle == "" ? select.value : " / " + select.value;
  });
  for (let i = 0; i < productObj.length; i++) {
    if (variantTitle == productObj[i].title) {
      document.getElementById(`varId-${el.id}`).value = productObj[i].id;
      console.log(productObj[i]);
      if (productObj[i].featured_image) {
        el.closest(".product_item").querySelector(".upsell_img").src =
          productObj[i].featured_image.src;
      }

      el.closest(".product_item").querySelector(".upsell_price_UT").innerHTML =
        currencySymbol + (productObj[i].price / 100).toFixed(2);
        el.closest(".product_item").querySelector(".upsell_cap_price_UT").innerHTML =
        currencySymbol + (productObj[i].compare_at_price / 100).toFixed(2);

        
    }
  }
};
const drawUpsell = (el) => {
  let upsell_wrapper = document.getElementById("upsell_wrapper");
  let upsellId = [];
  let upsellUniqId = [];
  let upsellTitle = [];
  let cartItems = [];
  let htmlEl = [];
  let upsellUniqItems = [];
  cart_upsell.style.filter = "blur(3px)";
  function handleResponse() {
    let divEl = document.createElement("div");
    divEl.innerHTML = this.responseText;
    let upsell_box = divEl.querySelectorAll(".product_item");
    //  "Product data from upesll, uniq id and html elements with id"
    upsell_box.forEach((element) => {
      upsellId.push(+element.dataset.metafield_id);
      htmlEl.push({ id: element.dataset.metafield_id, element: element });
    });
    // "get ids items from cart and set in array";
    el.items.forEach((element) => {
      upsellTitle.push(element.title.split(" -")[0]);
      cartItems.push(element.id);
    });

    // "filter upsellIDs and get only uniq values";
    upsellUniqId = upsellId.filter((value, index, self) => {
      return !cartItems.includes(self.indexOf(value) === index);
    });

    //  "filter HTMLs elements and get only uniq"
    for (let i = 0; i < upsellUniqId.length; i++) {
      const item = htmlEl[i];
      for (let j = 0; j < upsellUniqId.length; j++) {
        const element = upsellUniqId[j];

        if (+item.id === element) {
          upsellUniqItems.push(item);
          break;
        }
      }
    }
    upsellUniqItems = htmlEl.filter((data, index) => {
      return upsellUniqId.indexOf(+data.id) === index;
    });
    // filter upsell by same title
    upsellUniqItems = upsellUniqItems.filter((data) => {
      return !upsellTitle.includes(data.element.dataset.producttitle);
    });

    // "filter cart and upsell items and remoove frome upsell if find same with cart"
    if (upsell_wrapper.dataset.upsellvariants === "false") {
      upsellUniqItems = upsellUniqItems.filter((data) => {
        return !cartItems.includes(+data.id);
      });
    }

    upsell_wrapper.innerHTML = "";
    upsellUniqItems.map(({ element }) => {
      upsell_wrapper.appendChild(element);
    });
    if (!upsellUniqItems.length) {
      cart_upsell.style.display = "none";
    } else {
      cart_upsell.style.display = "unset";
    }

    cart_upsell.style.filter = "unset";
  }
  // get upsell products and call draw function
  const request = new XMLHttpRequest();
  request.addEventListener("load", handleResponse);
  request.open("GET", "/?snippets=UTcart", true);
  request.send();
};
const findProductByHandle = (el, upsellArr, productsTag) => {
  let productsWithTags = [];
  el.items.map(({ handle }) => {
    fetch(`https://developmentshin.myshopify.com/products/${handle}.js`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((product) => {
        productsWithTags.push(product);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
  setTimeout(() => {
    findUpsellProductByHandle(productsWithTags, upsellArr, productsTag);
  }, 400);
};
const findUpsellProductByHandle = (product, upsellArr, productsTag) => {
  product.map(({ tags }) => {
    tags.map((tag) => {
      if (tag.includes("upsell")) {
        upsellArr.push(tag);
      }
    });
  });
  product.map(({ tags }) => {
    tags.map((tag) => {
      productsTag.push(tag);
    });
  });
  upsellArr.map((data) => {
    if (productsTag.indexOf(`${data.replace("-upsell", "")}-main`) === -1) {
      removeUnusedUpsellProduct(data);
    }
  });
};
const removeUnusedUpsellProduct = (handle) => {
  if (handle?.includes("upsell"))
    fetch(
      `https://developmentshin.myshopify.com/products/${handle.replace(
        "-upsell",
        ""
      )}.js`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((product) => {
        product.variants.map((data) => {
          document.querySelectorAll(".item--loadbar").forEach((el) => {
            if (data.id === +el.id.split("-")[1]) {
              updateItem(data.id, 0);
            }
          });
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
};
