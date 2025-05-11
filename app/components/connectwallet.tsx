import { connect } from '@stacks/connect';

export default function ConnectWallet() {
    return (
        <button onClick={() => connect()}>Connect</button>
    );
}


