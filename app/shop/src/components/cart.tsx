import Command from "./command";

export default ({cart}: {cart :  Array<any>}) =>
    <div class="card card-side bg-base-100 shadow-xl my-5 sm:w-2/3">
        <figure><img class="w-48" src="public/images/basket.jpg" alt="Movie"/></figure>
        <div class="card-body">
            <h2 class="card-title">Lets see what you've got...</h2>

            <table class="table">
                <thead>
                <tr>
                    <th>Qty</th>
                    <th>Item</th>
                </tr>
                </thead>
                <tbody>
                    { cart.map((c, idx) =>
                        <tr><td>1</td><td>{c.heading}</td></tr>
                    )}
                </tbody>
            </table>

            <div class="card-actions justify-end">
                <Command command='/explore'/>
                <Command command='/checkout'/>
            </div>
        </div>
    </div>


