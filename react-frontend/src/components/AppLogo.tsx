import Logo from '@/assets/logo.svg';

export function AppLogo(){
    return(
        <div className={'flex w-[200px] h-[200px] p-2 m-auto'}>
            <img src={Logo} alt='logo' />
        </div>
    )
}