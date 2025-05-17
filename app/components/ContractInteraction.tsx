'use client';

import { useState } from 'react';
import { BrowserProvider, Contract, JsonRpcSigner, parseEther } from 'ethers';
import parentChildRegistryABI from '../abi/parentChildRegistry.json';
import taskRegistryABI from '../abi/taskRegistry.json';

// Contract addresses
const PARENT_CHILD_REGISTRY_ADDRESS = '0xf88C501cBA1DB713c080F886c74DB87ffd616FB2';
const TASK_REGISTRY_ADDRESS = '0x9404078DD16F12C7527215feEEcF4fF86F96DA3c';

// RPC URL
const RPC_URL = 'https://evm-tst3.exsat.network';

type Tab = 'createTask' | 'releaseTask' | 'getTasksByParent' | 'getTasksByChild' | 'getTaskDetails' | 'checkBalance';

export default function ContractInteraction() {
  const [activeTab, setActiveTab] = useState<Tab>('createTask');
  const [childAddress, setChildAddress] = useState('');
  const [secret, setSecret] = useState('');
  const [amount, setAmount] = useState('');
  const [taskId, setTaskId] = useState('');
  const [status, setStatus] = useState('');
  const [children, setChildren] = useState<any[]>([]);
  const [tasks, setTasks] = useState<number[]>([]);
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const [hasBalance, setHasBalance] = useState<boolean | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        setStatus('Please install MetaMask');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setStatus('Wallet connected successfully!');
    } catch (error) {
      setStatus('Error connecting wallet: ' + (error as Error).message);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setStatus('Wallet disconnected');
  };

  const addChild = async () => {
    if (!signer) {
      setStatus('Please connect your wallet first');
      return;
    }

    try {
      const contract = new Contract(
        PARENT_CHILD_REGISTRY_ADDRESS,
        parentChildRegistryABI.output.abi,
        signer
      );

      const tx = await contract.addChild(childAddress, secret);
      await tx.wait();

      setStatus(`Child added successfully! Transaction hash: ${tx.hash}`);
    } catch (error) {
      setStatus('Error adding child: ' + (error as Error).message);
    }
  };

  const getChildren = async () => {
    if (!signer || !address) {
      setStatus('Please connect your wallet first');
      return;
    }

    try {
      console.log('Getting children for address:', address);
      console.log('Using contract address:', PARENT_CHILD_REGISTRY_ADDRESS);
      
      const contract = new Contract(
        PARENT_CHILD_REGISTRY_ADDRESS,
        parentChildRegistryABI.output.abi,
        signer
      );

      // First try to get the child count to verify access
      try {
        const count = await contract.getChildCount(address);
        console.log('Child count:', count.toString());
        
        // If we have children, try to get them one by one
        if (count > 0) {

              const [address] = await window.ethereum.request({ method: "eth_requestAccounts" });
              const result = await contract.getChildren(address);


          setChildren(children);
          setStatus('Children retrieved successfully!');
        } else {
          setChildren([]);
          setStatus('No children found for this address');
        }
      } catch (countError) {
        console.error('Error getting child count:', countError);
        setStatus('Error getting child count: ' + (countError as Error).message);
      }
    } catch (error) {
      console.error('Full error details:', error);
      if (error instanceof Error) {
        setStatus(`Error getting children: ${error.message}`);
      } else {
        setStatus('Error getting children: Unknown error occurred');
      }
    }
  };

  const createTask = async () => {
    if (!signer) {
      setStatus('Please connect your wallet first');
      return;
    }

    try {
      const contract = new Contract(
        TASK_REGISTRY_ADDRESS,
        taskRegistryABI.output.abi,
        signer
      );

      const tx = await contract.createTask(childAddress, parseEther(amount), { value: parseEther(amount) });
      await tx.wait();

      setStatus(`Task created successfully! Transaction hash: ${tx.hash}`);
    } catch (error) {
      setStatus('Error creating task: ' + (error as Error).message);
    }
  };

  const releaseTask = async () => {
    if (!signer) {
      setStatus('Please connect your wallet first');
      return;
    }

    try {
      const contract = new Contract(
        TASK_REGISTRY_ADDRESS,
        taskRegistryABI.output.abi,
        signer
      );

      const tx = await contract.release(taskId);
      await tx.wait();

      setStatus(`Task released successfully! Transaction hash: ${tx.hash}`);
    } catch (error) {
      setStatus('Error releasing task: ' + (error as Error).message);
    }
  };

  const getTasksByParent = async () => {
    if (!provider) {
      setStatus('Please connect your wallet first');
      return;
    }

    try {
      const contract = new Contract(
        TASK_REGISTRY_ADDRESS,
        taskRegistryABI.output.abi,
        provider
      );

      const result = await contract.getTasksByParent(childAddress);
      setTasks(result);
      setStatus('Tasks retrieved successfully!');
    } catch (error) {
      setStatus('Error getting tasks: ' + (error as Error).message);
    }
  };

  const getTasksByChild = async () => {
    if (!provider) {
      setStatus('Please connect your wallet first');
      return;
    }

    try {
      const contract = new Contract(
        TASK_REGISTRY_ADDRESS,
        taskRegistryABI.output.abi,
        provider
      );

      const result = await contract.getTasksByChild(childAddress);
      setTasks(result);
      setStatus('Tasks retrieved successfully!');
    } catch (error) {
      setStatus('Error getting tasks: ' + (error as Error).message);
    }
  };

  const getTaskDetails = async () => {
    if (!provider) {
      setStatus('Please connect your wallet first');
      return;
    }

    try {
      const contract = new Contract(
        TASK_REGISTRY_ADDRESS,
        taskRegistryABI.output.abi,
        provider
      );

      const result = await contract.getTaskDetails(taskId);
      setTaskDetails(result);
      setStatus('Task details retrieved successfully!');
    } catch (error) {
      setStatus('Error getting task details: ' + (error as Error).message);
    }
  };

  const checkBalance = async () => {
    if (!provider) {
      setStatus('Please connect your wallet first');
      return;
    }

    try {
      const contract = new Contract(
        TASK_REGISTRY_ADDRESS,
        taskRegistryABI.output.abi,
        provider
      );

      const result = await contract.hasEnoughBalance(taskId);
      setHasBalance(result);
      setStatus('Balance check completed!');
    } catch (error) {
      setStatus('Error checking balance: ' + (error as Error).message);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'createTask':
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Child Address:</label>
              <input
                type="text"
                value={childAddress}
                onChange={(e) => setChildAddress(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="block mb-2">Amount (in XBTC):</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="0.1"
              />
            </div>
            <button
              onClick={createTask}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Task
            </button>
          </div>
        );

      case 'releaseTask':
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Task ID:</label>
              <input
                type="text"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter task ID"
              />
            </div>
            <button
              onClick={releaseTask}
              className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Release Task
            </button>
          </div>
        );

      case 'getTasksByParent':
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Parent Address:</label>
              <input
                type="text"
                value={childAddress}
                onChange={(e) => setChildAddress(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="0x..."
              />
            </div>
            <button
              onClick={getTasksByParent}
              className="w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Get Tasks
            </button>
          </div>
        );

      case 'getTasksByChild':
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Child Address:</label>
              <input
                type="text"
                value={childAddress}
                onChange={(e) => setChildAddress(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="0x..."
              />
            </div>
            <button
              onClick={getTasksByChild}
              className="w-full p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Get Tasks
            </button>
          </div>
        );

      case 'getTaskDetails':
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Task ID:</label>
              <input
                type="text"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter task ID"
              />
            </div>
            <button
              onClick={getTaskDetails}
              className="w-full p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Get Task Details
            </button>
          </div>
        );

      case 'checkBalance':
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Task ID:</label>
              <input
                type="text"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter task ID"
              />
            </div>
            <button
              onClick={checkBalance}
              className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Check Balance
            </button>
          </div>
        );
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Task Registry Interaction</h1>
      
      <div className="mb-4">
        {!address ? (
          <button
            onClick={connectWallet}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
            <span className="text-sm">Connected: {address}</span>
            <button
              onClick={disconnectWallet}
              className="p-1 text-sm text-red-500 hover:text-red-600"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {address && (
        <>
          <div className="mb-4">
            <div className="flex space-x-2 border-b">
              <button
                onClick={() => setActiveTab('createTask')}
                className={`p-2 ${activeTab === 'createTask' ? 'border-b-2 border-blue-500' : ''}`}
              >
                Create Task
              </button>
              <button
                onClick={() => setActiveTab('releaseTask')}
                className={`p-2 ${activeTab === 'releaseTask' ? 'border-b-2 border-green-500' : ''}`}
              >
                Release Task
              </button>
              <button
                onClick={() => setActiveTab('getTasksByParent')}
                className={`p-2 ${activeTab === 'getTasksByParent' ? 'border-b-2 border-purple-500' : ''}`}
              >
                Get Tasks by Parent
              </button>
              <button
                onClick={() => setActiveTab('getTasksByChild')}
                className={`p-2 ${activeTab === 'getTasksByChild' ? 'border-b-2 border-indigo-500' : ''}`}
              >
                Get Tasks by Child
              </button>
              <button
                onClick={() => setActiveTab('getTaskDetails')}
                className={`p-2 ${activeTab === 'getTaskDetails' ? 'border-b-2 border-yellow-500' : ''}`}
              >
                Get Task Details
              </button>
              <button
                onClick={() => setActiveTab('checkBalance')}
                className={`p-2 ${activeTab === 'checkBalance' ? 'border-b-2 border-red-500' : ''}`}
              >
                Check Balance
              </button>
            </div>
          </div>

          <div className="mt-4">
            {renderTabContent()}
          </div>
        </>
      )}

      {status && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p>{status}</p>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Tasks:</h2>
          <ul className="list-disc pl-5">
            {tasks.map((taskId, index) => (
              <li key={index}>Task ID: {taskId.toString()}</li>
            ))}
          </ul>
        </div>
      )}

      {taskDetails && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Task Details:</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p>ID: {taskDetails.id.toString()}</p>
            <p>Parent: {taskDetails.parent}</p>
            <p>Child: {taskDetails.child}</p>
            <p>Amount: {taskDetails.amount.toString()}</p>
            <p>Released: {taskDetails.released.toString()}</p>
          </div>
        </div>
      )}

      {hasBalance !== null && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Balance Check Result:</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p>Has enough balance: {hasBalance ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}
    </div>
  );
} 