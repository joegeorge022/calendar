#include <stdio.h>
struct polynomial { int coeff, expo; };
int main() {
    struct polynomial p1[3], p2[3], res[6];
    int n1, n2, i = 0, j = 0, k = 0;

    printf("Enter number of terms in polynomial1: ");
    scanf("%d", &n1);
    printf("Enter terms (coeff exponent) in descending order:\n");
    for (int x = 0; x < n1; x++) scanf("%d%d", &p1[x].coeff, &p1[x].expo);

    printf("Enter number of terms in polynomial2: ");
    scanf("%d", &n2);
    printf("Enter terms (coeff exponent) in descending order:\n");
    for (int x = 0; x < n2; x++) scanf("%d%d", &p2[x].coeff, &p2[x].expo);

    while (i < n1 && j < n2)
        if (p1[i].expo == p2[j].expo)
            res[k++] = (struct polynomial){p1[i].coeff + p2[j].coeff, p1[i].expo}, i++, j++;
        else if (p1[i].expo > p2[j].expo)
            res[k++] = p1[i++];
        else
            res[k++] = p2[j++];
    while (i < n1) res[k++] = p1[i++];
    while (j < n2) res[k++] = p2[j++];

    printf("Resultant polynomial: ");
    for (int x = 0; x < k; x++)
        printf("%d x^%d%s", res[x].coeff, res[x].expo, x + 1 < k ? " + " : "\n");
}
