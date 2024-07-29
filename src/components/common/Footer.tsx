import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="w-full bg-light">
            <section className="sm:mx-8 md:mx-12 lg:mx-16">
                <p className="py-3 text-sm">
                    This tool is a joint project of UC Berkeley's Energy and Resources Group and Center for Law, Energy & the Environment. See About [link] for more information. 
                </p>
                {/* <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <Image src="/images/Berk-ERG.png" 
                        alt="Example Image" 
                        // layout="responsive"
                        width={240}
                        height={40}
                        className="object-contain "
                        />
                    </div>
                    <div className="flex-1">
                        <Image src="/images/Berk-CLEE.png" 
                        alt="Example Image" 
                        // layout="responsive"
                        width={350}
                        height={40}
                        className="object-contain  "
                        />
                    </div>
                </div> */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 flex justify-center">
                        <img
                        src="/images/Berk-ERG.png"
                        alt="Example Image"
                        className="h-10 object-contain"
                        // style="height: 40px; width: auto;"
                        />
                    </div>
                    <div className="flex-1 flex justify-center">
                        <img
                        src="/images/Berk-CLEE.png"
                        alt="Example Image"
                        className="h-10 object-contain"
                        // style="height: 40px; width: auto;"
                        />
                    </div>
                    </div>
            </section>
        </footer>
    )
}

export default Footer