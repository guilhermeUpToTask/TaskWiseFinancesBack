import dayjs, { Dayjs } from "dayjs";
import { Annotation, NewAnnotation, } from "../../types";

export function reduceCheckedAnnotations(annotations: Annotation[]): { ids: number[], value: number } {
    return annotations.reduce((acc, curr) => {

        if (['recived', 'payed'].includes(curr.status)) {
            console.log(curr);
            return {
                ids: [...acc.ids, curr.id],
                value: (curr.annon_type === 'payment') ? acc.value + curr.value :
                    acc.value - curr.value
            }
        } else {
            return acc;
        }

    }, { ids: [], value: 0 })
}



export function getRepeatedAnnotations(
    annotation: NewAnnotation,
    quantity: number
): NewAnnotation[] {

    if (annotation.repeat === 'never' || quantity <= 1)
        return [annotation];

    const newArr: NewAnnotation[] = new Array(quantity).fill(annotation);

    return newArr.map((ann, i) => {
        if (i > 0) {
            return {
                ...ann,
                name: `${ann.name} - ${i + 1}`,
                description: `${ann.description} - ${i + 1} - repeated generate`,
                date: dayjs(ann.date).add(i,
                    (annotation.repeat !== 'never') ? annotation.repeat : 'day').format('YYYY-MM-DD'),
            }
        }
        else {
            return ann
        }
    })
}
