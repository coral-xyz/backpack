import { useCallback, useEffect, useMemo, useState } from "react";

import { Transaction } from "ethers6";

import { useRefreshingQuery } from "../../_hooks/useRefreshingQuery";
import { BlowfishCrossChainResult } from "../../_sharedComponents/BlowfishEvaluation";
import { EthereumScanTransactionsResponse } from "../../_types/BlowfishTypes";

export interface TxnsScanResult {
  isLoading: boolean;
  error: Error | null;
  evaluation?: EthereumScanTransactionsResponse;
  normalizedEvaluation?: BlowfishCrossChainResult;
}

const REQUEST_TIMEOUT_LIMIT = 10000;
// const REFETCH_INTERVAL_MS = 5000;

export const useFetchEthereumBlowfishEvaluation = (
  apiUrl: string,
  transactions: Transaction[],
  dappUrl: string,
  userAccount: string | undefined,
  onError: (error: Error) => void
): TxnsScanResult => {
  const origin = getOrigin(dappUrl) || "";

  const queryFn = useCallback(async (): Promise<{
    evaluation?: EthereumScanTransactionsResponse;
    error?: any;
  }> => {
    try {
      // Abort request if takes too long
      const controller = new AbortController();
      const signal = controller.signal;
      setTimeout(() => {
        controller.abort();
      }, REQUEST_TIMEOUT_LIMIT);

      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("X-API-VERSION", "2023-06-05");
      const params = {
        txObjects: transactions.map((tx) => ({
          from: tx.from ?? userAccount,
          to: tx.to,
          data: tx.data,
          value: tx.value.toString(),
        })),
        userAccount,
        metadata: {
          origin,
        },
      };
      const init = {
        method: "POST",
        headers,
        body: JSON.stringify(params),
      };

      const endpoint = `${apiUrl}?language=en`;
      const request = new Request(endpoint, init);
      const response = await fetch(request, { signal });

      if (response.ok) {
        // Returned success, parse body
        const evaluation = await response.json();
        return { evaluation };
      } else {
        const errMessage = await response.json();
        return {
          error: new Error(
            `Blowfish API returned non-200 response: ${
              response.status
            }: ${JSON.stringify(errMessage)}`
          ),
        };
      }
    } catch (error: any) {
      // Note(fabio): Must lowercase error message b/c in React Native the keyword is capitalized
      // whereas in the browser-ext it isn't
      if (error.message.toLowerCase().includes("aborted")) {
        return { error: new Error("Request timeout reached") };
      } else {
        // Other error
        return { error };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify({ transactions, origin, userAccount })]);

  const txnsEvaluationQuery = useRefreshingQuery(queryFn, 5000);
  const txnsScanResult = useMemo(() => {
    const txnsScanEvaluation = txnsEvaluationQuery.data?.evaluation;
    return {
      isLoading: !txnsEvaluationQuery.isFetched,
      error: txnsEvaluationQuery.data?.error || txnsEvaluationQuery.error,
      evaluation: txnsScanEvaluation,
      normalizedEvaluation: txnsScanEvaluation
        ? normalizeEvaluation(txnsScanEvaluation)
        : undefined,
    };
  }, [txnsEvaluationQuery]);

  const txnsScanResultError = txnsScanResult.error;
  useEffect(() => {
    if (txnsScanResultError) {
      onError(txnsScanResultError);
    }
  }, [onError, txnsScanResultError]);

  return txnsScanResult;
};

const getOrigin = (url?: string): string | undefined => {
  if (!url) {
    return undefined;
  }
  try {
    const _url = new URL(url);
    return _url.origin;
  } catch (err) {
    return undefined;
  }
};

function normalizeEvaluation(
  evaluation: EthereumScanTransactionsResponse
): BlowfishCrossChainResult | undefined {
  try {
    const simulationError =
      evaluation.simulationResults.aggregated.error?.humanReadableError;
    return {
      action: evaluation.action,
      warnings: evaluation.warnings,
      errors: [
        ...(simulationError ? [simulationError] : []),
        ...evaluation.simulationResults.perTransaction
          .map((tx) => tx.error?.humanReadableError ?? null)
          .filter<string>(Boolean as any),
      ],
      expectedStateChanges: Object.fromEntries(
        Object.entries(
          evaluation.simulationResults.aggregated.expectedStateChanges ?? {}
        ).map(([address, changes]) => {
          const normalizedChanges: NonNullable<
            BlowfishCrossChainResult["expectedStateChanges"]
          >[string] = changes.map((change) => {
            const assetImageUrl =
              "asset" in change.rawInfo.data &&
              "imageUrl" in change.rawInfo.data.asset
                ? change.rawInfo.data.asset.imageUrl
                : null;
            const metadataImageUrl =
              "metadata" in change.rawInfo.data &&
              "rawImageUrl" in change.rawInfo.data.metadata
                ? change.rawInfo.data.metadata.rawImageUrl
                : null;
            const imageUrl = assetImageUrl ?? metadataImageUrl;
            const asset = imageUrl
              ? {
                  isNonFungible:
                    change.rawInfo.kind.includes("ERC721") ||
                    change.rawInfo.kind.includes("ERC1155"),
                  imageUrl,
                  name: change.rawInfo.data.asset.name,
                }
              : undefined;
            return {
              humanReadableDiff: change.humanReadableDiff,
              suggestedColor: "NONE",
              asset,
            };
          });
          return [address, normalizedChanges];
        })
      ),
    };
  } catch (e) {
    console.error(e, "Unexpected Blowfish Schema");
    return undefined;
  }
}
