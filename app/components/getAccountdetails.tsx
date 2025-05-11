import { getLocalStorage, request } from '@stacks/connect';

export default function GetAccountDetails() {        
        const userData = getLocalStorage();
        console.log(userData?.addresses.stx[0].address);   
}
