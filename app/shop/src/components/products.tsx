
import { ProductOrCategory } from '../init_config'
import Command from './command'



const SCaracel =  ({categories, imageBaseUrl}: {categories :  Array<ProductOrCategory>, imageBaseUrl : string}) =>  
<section
      aria-labelledby=":ds46:-carousel-heading"
      class="ds-c-carousel ds-c-carousel--snap-start ds-c-carousel--auto-fill-columns"
      data-pkgid="@sainsburys-tech/fable-3.18.0-carousel"
    >
      <div
        class="ds-c-carousel__header ds-c-carousel__header--above-responsive-sm"
      >
        <div class="ds-c-carousel__heading-section">
          <h2
            class="ds-c-display-3 ds-c-carousel__heading"
            data-pkgid="@sainsburys-tech/fable-3.18.0-display-3"
            id=":ds46:-carousel-heading"
          >
            Heading
          </h2>
          <span
            class="ds-c-body-1 ds-c-carousel__supporting-text"
            data-pkgid="@sainsburys-tech/fable-3.18.0-body-1"
          >
            Supporting text
          </span>
          <a
            class="ds-c-link ds-c-carousel__heading-link"
            href="www.example.com"
            data-pkgid="@sainsburys-tech/fable-3.18.0-link"
          >
            Link text
          </a>
        </div>
      </div>
      <div
        class="ds-c-carousel__slides-wrapper ds-c-carousel__slides-wrapper--above-responsive-sm"
      >
        <button
          class="ds-c-button ds-c-button--secondary ds-c-button--icon ds-c-button--sr-only ds-c-carousel__control ds-c-carousel__control--above-responsive-sm ds-c-carousel__control--previous ds-c-carousel__control--previous-above-responsive-sm"
          data-scheme="ds-global-cta--brand-1"
          data-pkgid="@sainsburys-tech/fable-3.18.0-iconbutton"
          aria-hidden="true"
        >
          <span class="ds-c-button__icon"><svg></svg></span>
          <span class="ds-c-button__icon--sr-only">Previous</span>
        </button>
        <ol class="ds-c-carousel__slides">
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(153, 51, 0);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                1
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(153, 102, 0);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                2
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(153, 153, 0);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                3
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(102, 153, 0);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                4
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(51, 153, 0);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                5
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(0, 153, 0);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                6
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(0, 153, 51);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                7
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(0, 153, 102);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                8
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(0, 153, 153);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                9
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(0, 102, 153);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                10
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(0, 51, 153);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                11
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(0, 0, 153);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                12
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(51, 0, 153);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                13
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(102, 0, 153);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                14
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(153, 0, 153);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                15
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(153, 0, 102);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                16
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(153, 0, 51);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                17
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(153, 0, 0);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                18
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(153, 51, 0);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                19
              </span>
            </a>
          </li>
          <li
            class="ds-c-carousel__slide"
            data-pkgid="@sainsburys-tech/fable-3.18.0-carousel-slide"
          >
            <a
              href="www.example.com"
              style="display: flex; align-items: center; justify-content: center; height: 250px; width: 250px; background-color: rgb(153, 102, 0);"
            >
              <span
                style="font-size: 3rem; color: rgb(255, 255, 255); font-weight: 700;"
              >
                20
              </span>
            </a>
          </li>
          <li class="ds-c-carousel__slide">
            <a class="ds-c-carousel__slide--more-link" href="www.example.com">
              <span
                class="ds-c-button ds-c-button--primary"
                data-pkgid="@sainsburys-tech/fable-3.18.0-button"
              >
                See all items
              </span>
            </a>
          </li>
        </ol>
        <button
          class="ds-c-button ds-c-button--secondary ds-c-button--icon ds-c-button--sr-only ds-c-carousel__control ds-c-carousel__control--above-responsive-sm ds-c-carousel__control--next"
          data-scheme="ds-global-cta--brand-1"
          data-pkgid="@sainsburys-tech/fable-3.18.0-iconbutton"
        >
          <span class="ds-c-button__icon"><svg></svg></span>
          <span class="ds-c-button__icon--sr-only">Next</span>
        </button>
      </div>
    </section>


export default ({categories, imageBaseUrl}: {categories :  Array<ProductOrCategory>, imageBaseUrl : string}) =>  

    <div class="flex flex-row flex-wrap gap-5 my-5">
        { categories.map((c, i) => 
        
            <div key={i} class="card bg-base-100 shadow-xl basis-60">
                <figure><img class="h-48 object-cover"  src={`${imageBaseUrl}/${c.image.pathname}`} alt="Shoes" /></figure>
                <div class="card-body">
                <h2 class="card-title">{c.heading}</h2>
                    <p>{c.description.substring(0, 80) }...</p>
                <div class="card-actions justify-end">
                    { c.type === 'Category' ?
                        <Command command='/explore'subcommand={c.heading} args={c._id}/>
                       : [
                        <Command method='post' command='/add' args={c._id}/>,
                        <Command command='/details'  args={c._id}/>
                       ]

                    }
                
                </div>
                </div>
            </div>
        )}
    </div>

