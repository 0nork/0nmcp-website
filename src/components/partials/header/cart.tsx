import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProductCounterButton from "@/components/ecommarce/product-counter-button";

export function Cart() {
    const cartProducts = [
        {
            id: 1,
            productImage: "/images/e-commerce/product-card/classical-black-tshirt.png"
        },
        {
            id: 2,
            productImage: "/images/e-commerce/product-card/black-t-shirt.png"
        },
        {
            id: 3,
            productImage: "/images/e-commerce/product-card/check-shirt.png"
        },
        {
            id: 4,
            productImage: "/images/e-commerce/product-card/gray-jumper.png"
        },
        {
            id: 5,
            productImage: "/images/e-commerce/product-card/gray-t-shirt.png"
        },
        {
            id: 6,
            productImage: "/images/e-commerce/product-card/pink-blazer.png"
        }
    ]
    return (
        <Sheet >
            <SheetTrigger asChild>
                <button type="button" className="relative focus:ring-none focus:outline-hidden md:h-8 md:w-8 md:bg-secondary  text-secondary-foreground   rounded-full  flex flex-col items-center justify-center cursor-pointer">
                    <Icon icon="heroicons:shopping-cart" className="h-5 w-5" />
                    <Badge className=" w-4 h-4 p-0 text-[8px] rounded-full  font-semibold  items-center justify-center absolute left-[calc(100%-12px)] bottom-[calc(100%-10px)] " color="destructive">
                        0
                    </Badge>
                </button>
            </SheetTrigger>
            <SheetContent overlayClass="bg-transparent backdrop-blur-none" className="p-0 flex flex-col">
                <SheetHeader className="flex-none items-start space-y-1 border-b border-default-100 px-6 py-4">
                    <SheetTitle className="text-xl text-default-900 font-medium">Cart</SheetTitle>
                    <SheetDescription className="text-sm font-light text-default-600">
                        Total Price $0
                    </SheetDescription>
                </SheetHeader>
                {
                    cartProducts.length > 0 ? (
                        <ScrollArea className="h-full">
                            <div className=" h-full divide-y divide-border">
                                {cartProducts.map((product, i) => (
                                    <div className="flex gap-4 px-4 py-3 first:pt-0 last: " key={i}>
                                        <div className="flex-none mt-0.5">
                                            <div className="md:w-20 md:h-20 w-14 h-14 bg-default-200 dark:bg-default-600  rounded">
                                                <Image
                                                    src={product.productImage}
                                                    alt=""
                                                    className=" w-full h-full object-cover p-3"
                                                    width={100}
                                                    height={100}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1  space-y-1 ">
                                            <div className="md:text-base text-sm   font-normal  text-default-900">
                                                Classical Black T-Shirt Classical Black T-Shirt
                                            </div>
                                            <div className="text-sm text-default-500 pb-2">
                                                Price: <span className="text-xs">$489</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <ProductCounterButton />
                                                <Button
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full   bg-default-300/80 text-default-800 hover:bg-destructive hover:text-destructive-foreground hover:ring-transparent hover:ring-0">
                                                    <Icon icon="heroicons:trash" className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )
                        : (
                            <div className="flex-1 h-full flex flex-col justify-center items-center">
                                <div className="h-40 w-40 overflow-hidden bg-default-200/60  rounded-full mx-auto relative flex items-center justify-center">
                                    <Icon
                                        icon="solar:cart-2-bold-duotone"
                                        className=" w-32  h-32 relative "
                                    />
                                </div>
                            </div>
                        )
                }


                <SheetFooter className="flex-none block border-t border-default-100 p-6">
                    <div className="flex">
                        <div className="flex-1  text-base font-medium leading-none text-default-900">Subtotal</div>
                        <div className="flex-none text-base font-medium leading-none text-default-900">$0</div>
                    </div>
                    <div className="flex gap-3 mt-4 flex-wrap">
                        <Button className="flex-1">Continue to Shipping</Button>
                        <Button className="flex-1">View Cart</Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
