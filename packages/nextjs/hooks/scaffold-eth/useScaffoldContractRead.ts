"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { useScaffoldContract } from "./useScaffoldContract";
import { Abi, Address } from "viem";

type ContractFunctionNames = 
  | "caseEvidence"
  | "cases"
  | "getCase"
  | "getCaseEvidence"
  | "getPlayerCases"
  | "playerCases"
  | "premium"
  | "greeting"
  | "owner"
  | "totalCounter"
  | "userGreetingCounter";

type ContractEventNames = 
  | "CaseCreated"
  | "EvidenceSubmitted"
  | "PhaseChanged"
  | "VerdictReached"
  | "GreetingChange";

type ContractFunctionArgs = {
  caseEvidence: readonly [bigint];
  cases: readonly [bigint];
  getCase: readonly [bigint];
  getCaseEvidence: readonly [bigint];
  getPlayerCases: readonly [string];
  playerCases: readonly [string, bigint];
  premium: readonly [];
  greeting: readonly [];
  owner: readonly [];
  totalCounter: readonly [];
  userGreetingCounter: readonly [string];
};

type UseScaffoldContractReadConfig<TAbi extends Abi> = {
  contractName: "LegalGame" | "YourContract";
  functionName: ContractFunctionNames;
  args?: ContractFunctionArgs[ContractFunctionNames];
  watch?: boolean;
};

export function useScaffoldContractRead<TAbi extends Abi>({
  contractName,
  functionName,
  args,
  watch = true,
}: UseScaffoldContractReadConfig<TAbi>) {
  const { data: contract } = useScaffoldContract({ contractName });
  const publicClient = usePublicClient();
  const [data, setData] = useState<unknown>();

  useEffect(() => {
    if (!contract || !publicClient) return;

    const readContract = async () => {
      try {
        const result = await publicClient.readContract({
          address: contract.address as Address,
          abi: contract.abi,
          functionName,
          args,
        });
        setData(result);
      } catch (error) {
        console.error("Error reading contract:", error);
      }
    };

    readContract();

    if (watch) {
      const unwatch = publicClient.watchContractEvent({
        address: contract.address as Address,
        abi: contract.abi,
        eventName: "*" as ContractEventNames,
        onLogs: () => {
          readContract();
        },
      });

      return () => {
        unwatch();
      };
    }
  }, [contract, publicClient, functionName, args, watch]);

  return {
    data,
    isError: !contract || !publicClient,
    isLoading: !data && !contract,
  };
} 